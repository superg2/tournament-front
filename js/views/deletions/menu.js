define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/deletions/menu.html',
    'views/deletions/abstract',
    'models/participant',
    'pubsub'
], function ($, _, Backbone, deletionsMenuTemplate, AbstractView, Participant, Pubsub) {
    var DeletionsMenuView = AbstractView.extend({

        menuTemplate:_.template(deletionsMenuTemplate),
        nbDelsSelector:".nb-dels",

        handlers:[],

        events:{
            "drop #deleteDropZone":"onDrop",
            "dragover #deleteDropZone":"onDragOver",
            "dragleave #deleteDropZone":"onDragLeave",
            "click .delete-actions.cancel":"cancelDeletions",
            "click .delete-actions.confirm":"confirmDeletions",
            "click .delete":"removeElement"
        },

        initialize:function (el) {
            this.events = _.extend({}, AbstractView.prototype.events, this.events);
            this.handlers = _.extend([], AbstractView.prototype.handlers, this.handlers);
            this.type = "no"

            AbstractView.prototype.initialize.apply(this, arguments);

            this.handlers.push(Pubsub.subscribe(Events.DRAG_START, this.onDragStart.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.DRAG_END, this.onDragEnd.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.ELEM_DELETED_FROM_VIEW, this.render.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.DELETIONS_DONE, this.render.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.DELETIONS_POPULATED, this.render.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.DELETIONS_CANCELED, this.render.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.DELETION_CANCELED, this.render.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.VIEW_CHANGED, this.onViewChanged.bind(this)));
        },

        onViewChanged:function (type) {
            this.type = type;
            this.render();
        },

        render:function () {
            this.$el.html(this.menuTemplate({type:this.type}));
            this.initCollection();
            this.renderDels();
        },

        onDragStart:function () {
            $('.drop-zone').addClass('emphasize');
        },

        onDrop:function (event) {
            event.stopPropagation();
            event.preventDefault();
            var id = event.originalEvent.dataTransfer.getData('id');
            var type = event.originalEvent.dataTransfer.getData('type');

            if ((id != null) && (id != "")) {
                this.deleteElement(type, id);
                Pubsub.publish(Events.REMOVE_ALERT);
            }

            this.onDragEnd();
        },

        deleteElement:function (type, id) {
            this.getFromLocalStorage();
            this.addToCollection(type, id);
            this.storeInLocalStorage();

            Pubsub.publish(Events.ELEM_DELETED_FROM_BAR, [id]);
            this.renderDels();
        },

        addToCollection:function (type, id) {
            if (this.collection[type].indexOf(id) < 0) {
                this.collection[type].push(id);
            }
        },

        onDragEnd:function () {
            $('.drop-zone').removeClass('emphasize');
            this.clearDropZone();
        },

        emphasizeDropZone:function () {
            $('.drop-zone').addClass("dropable");
            $('.drop-zone a').addClass("dropable");
        },

        clearDropZone:function () {
            $('.drop-zone').removeClass("dropable");
            $('.drop-zone a').removeClass("dropable");
        },

        onDragOver:function (event) {
            event.preventDefault(); // allows us to drop
            event.originalEvent.dataTransfer.dropEffect = 'move';
            this.emphasizeDropZone();
            return false;
        },

        onDragLeave:function (event) {
            event.preventDefault(); // allows us to drop
            event.originalEvent.dataTransfer.dropEffect = 'move';
            this.clearDropZone();
            return false;
        },

        renderDels:function () {
            this.getFromLocalStorage();
            var nbDels = this.countElements(this.collection);
            $(this.nbDelsSelector).text(nbDels);
            nbDels > 0 ? $(".delete-actions").removeClass("hidden") : $(".delete-actions").addClass("hidden");
        },

        countElements:function (collection) {
            var elements = 0;
            $.each(collection, function (index, value) {
                elements += value.length;
            });
            return elements;
        },

        confirmDeletions:function (event) {
            event.stopPropagation();
            event.preventDefault();

            Pubsub.publish(Events.DELETIONS_CONFIRMED);
        },

        cancelDeletions:function (event) {
            event.stopPropagation();
            event.preventDefault();
            this.emptyCollection();
            this.storeInLocalStorage();
            Pubsub.publish(Events.DELETIONS_TO_CANCEL);
        },

        removeElement:function (event) {
            event.stopPropagation();
            event.preventDefault();
            Pubsub.publish(Events.DELETE_ELEM);
        }

    });

    return DeletionsMenuView;
});
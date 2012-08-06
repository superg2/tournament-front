define([
    'jquery',
    'underscore',
    'backbone',
    'models/participant',
    'text!templates/participants/edit.html',
    'backbone-validation',
    'pubsub'
], function ($, _, Backbone, Participant, participantEditTemplate, BackoneValidation, Pubsub) {

    var ParticipantEditView = Backbone.View.extend({

        template:_.template(participantEditTemplate),
        handlers:[],
        type:'edit',

        events:{
            "drop .well":"dropHandler",
            "dragover .well":"dragOverHandler",
            "input form input":"onInput",
            "submit form":"onSubmitForm"
        },

        initialize:function (model, active) {
            this.model = model;
            if (active == null || active == true) {
                this.initBindings();
            }
        },

        initBindings:function () {

            Backbone.Validation.bind(this);

            this.handlers.push(Pubsub.subscribe(Events.SAVE_ELEM, this.submitForm.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.ENTER_CALLED, this.submitForm.bind(this)));
            this.handlers.push(Pubsub.subscribe(Events.ECHAP_CALLED, this.blur.bind(this)));
        },

        removeBindings:function () {
            this.unbind();
            if (this.handlers) {
                $.each(this.handlers, function (index, value) {
                    Pubsub.unsubscribe(value);
                });
            }
        },

        render:function () {
            this.$el.html(this.template({participant:this.model.toJSON(), server_url:'http://localhost:3000/api'}));
            return this;
        },

        onInput:function (event) {
            if (event != null) {
                event.stopPropagation();
                event.preventDefault();
            }

            var target = event.currentTarget;

            var $parent = $(target.parentNode);
            var $help = $parent.find(".help-inline");
            var $controlGroup = $parent.parent();

            $help.text(target.validationMessage);

            if (target.validity.valid) {
                $controlGroup.removeClass("error");
            }
            else {
                $controlGroup.addClass("error");
            }

            this.focusedField = target;
        },

        submitForm:function () {
            this.$el.find("form input[type='submit']").click();
        },

        onSubmitForm:function (event) {
            if (event != null) {
                event.stopPropagation();
                event.preventDefault();
            }

            this.saveParticipant();
        },

        saveParticipant:function () {
            var attributes = {};
            this.$el.find("form input[type!='submit']").each(function (index, value) {
                attributes[value.name] = value.value;
                this.model.set(value.name, value.value);
            }.bind(this));

            if (this.model.isValid()) {
                this.model.save(null, {
                    success:this.onSaveSuccess.bind(this),
                    error:this.onSaveError.bind(this)
                });
            }
            else {
                Pubsub.publish(Events.ALERT_RAISED, ['Warning!', 'Fix validation errors and try again', 'alert-warning']);
            }
        },

        onSaveError:function (model, resp) {
            // error is an http one
            if (resp.hasOwnProperty("status")) {
                Pubsub.publish(Events.ALERT_RAISED, ['Error!', 'An error occurred while trying to update this item', 'alert-error']);
            }
        },

        onSaveSuccess:function (model, resp) {

            this.model = model;

            utils.clearValidationErrors();

            Pubsub.publish(Events.MODEL_CHANGED, [model]);

            if (this.pictureFile) {
                this.uploadFile(self.pictureFile, this.model.id,
                    this.afterSave().bind(this)
                );
            } else {
                this.afterSave();
            }
        },

        afterSave:function () {
            this.renderNext = true;
            Pubsub.publish(Events.ALERT_RAISED, ['Success!', 'Participant saved successfully', 'alert-success']);
            if (this.focusedField) {
                $(this.focusedField).focus();
            }
            if (this.type == 'add') {
                Backbone.history.navigate('/participant/' + this.model.id + "/edit", true);
            }
        },

        dragOverHandler:function (event) {
            event.preventDefault(); // allows us to drop
            event.originalEvent.dataTransfer.dropEffect = 'copy';
            return false;
        },

        dropHandler:function (event) {
            event.stopPropagation();
            event.preventDefault();
            var e = event.originalEvent;
            e.dataTransfer.dropEffect = 'copy';
            this.pictureFile = e.dataTransfer.files[0];

            // Read the image file from the local file system and display it in the img tag
            var reader = new FileReader();
            reader.onloadend = function () {
                $('.photo').attr('src', reader.result);
            };
            reader.readAsDataURL(this.pictureFile);
        },

        uploadFile:function (file, id, callbackSuccess) {
            var self = this;
            var data = new FormData();
            data.append('file', file);
            $.ajax({
                url:'http://localhost:3000/api/participant/' + id + '/photo',
                type:'POST',
                data:data,
                processData:false,
                cache:false,
                contentType:false
            })
                .done(function (response) {
                    console.log(file.name + " uploaded successfully");
                    callbackSuccess();
                })
                .fail(function (jqXHR, textStatus, errorMessage) {
                    Pubsub.publish(Events.ALERT_RAISED, ['Error!', 'An error occurred while uploading ' + file.name, 'alert-error']);
                });
        },

        blur:function () {
            this.$el.find("form input:focus").blur();
        }

    });

    return ParticipantEditView;
});
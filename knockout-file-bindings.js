/*
 * knockout-file-bindings
 * Copyright 2014 Muhammad Safraz Razik
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * Author: Muhammad Safraz Razik
 * Project: https://github.com/adrotec/knockout-file-bindings
 */
(function (factory) {
    // Module systems magic dance.

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS or Node: hard-coded dependency on "knockout"
        factory(require("knockout"));
    } else if (typeof define === "function" && define["amd"]) {
        // AMD anonymous module with hard-coded dependency on "knockout"
        define(["knockout"], factory);
    } else {
        // <script> tag: use the global `ko` object, attaching a `mapping` property
        factory(ko);
    }
}(function (ko) {

    var fileBindings = {
        customFileInputSystemOptions: {
            wrapperClass: 'custom-file-input-wrapper',
            fileNameClass: 'custom-file-input-file-name',
            buttonGroupClass: 'custom-file-input-button-group',
            buttonClass: 'custom-file-input-button',
            clearButtonClass: 'custom-file-input-clear-button',
            buttonTextClass: 'custom-file-input-button-text',
        },
        defaultOptions: {
            wrapperClass: 'input-group',
            fileNameClass: 'disabled form-control',
            noFileText: 'No file chosen',
            buttonGroupClass: 'input-group-btn',
            buttonClass: 'btn btn-primary',
            clearButtonClass: 'btn btn-default',
            buttonText: 'Choose File',
            changeButtonText: 'Change',
            clearButtonText: 'Clear',
            fileName: true,
            clearButton: true,
            onClear: function(fileData, options) {
                if (typeof fileData.clear === 'function') {
                    fileData.clear();
                }
            }
        },
    }

    function extendOptions(defaultOptions, newOptions) {
        var options = {};
        for (var prop in defaultOptions) {
            options[prop] = typeof newOptions[prop] !== 'undefined' ? newOptions[prop] : defaultOptions[prop];
        }
        return options;
    }

    function addRemoveCssClass(element, cssClasses, type){
        var cssClasses = Array.isArray(cssClasses) ? cssClasses : cssClasses.split(' ');
        cssClasses.forEach(function(cssClass){
            element.classList[type](cssClass);
        });
        return element;
    }

    function addCssClass(element, cssClasses){
        return addRemoveCssClass(element, cssClasses, 'add');
    }

    function removeCssClass(element, cssClasses){
        return addRemoveCssClass(element, cssClasses, 'remove');
    }

    function hasCssClass(element, cssClass){
        return element.classList.contains(cssClass);
    }

    var windowURL = window.URL || window.webkitURL;

    ko.bindingHandlers.fileInput = {
        init: function(element, valueAccessor) {
            var fileData = ko.utils.unwrapObservable(valueAccessor()) || {};
            if (fileData.dataUrl) {
                fileData.dataURL = fileData.dataUrl;
            }
            if (fileData.objectUrl) {
                fileData.objectURL = fileData.objectUrl;
            }
            fileData.file = fileData.file || ko.observable();
            fileData.fileArray = fileData.fileArray || ko.observableArray([]);
            var currentAcceptValue = element.getAttribute('accept');
            fileData.fileTypes = fileData.fileTypes || ko.observable(currentAcceptValue);
            element.setAttribute('accept', fileData.fileTypes());

            fileData.clear = fileData.clear || function() {
                ['objectURL', 'base64String', 'binaryString', 'text', 'dataURL', 'arrayBuffer'].forEach(function(property, i) {
                    if (fileData[property + 'Array'] && ko.isObservable(fileData[property + 'Array'])) {
                        var values = fileData[property + 'Array'];
                        while(values().length) {
                            var val = values.splice(0, 1);
                            if (property == 'objectURL') {
                                windowURL.revokeObjectURL(val);
                            }
                        }
                    }
                    if (fileData[property] && ko.isObservable(fileData[property])) {
                        fileData[property](null);
                    }
                });
                element.value = '';
                fileData.file(null);
                fileData.fileArray([]);
            }

            function fillData(file, index, callback){

                if (fileData.objectURL && ko.isObservable(fileData.objectURL)) {
                    var newUrl = file && windowURL.createObjectURL(file);
                    if (newUrl) {
                        var oldUrl = fileData.objectURL();
                        if (oldUrl) {
                            windowURL.revokeObjectURL(oldUrl);
                        }
                        fileData.objectURL(newUrl);
                    }
                }


                if (fileData.base64String && ko.isObservable(fileData.base64String)) {
                    if (!(fileData.dataURL && ko.isObservable(fileData.dataURL))) {
                        fileData.dataURL = ko.observable(); // adding on demand
                    }
                }
                if (fileData.base64StringArray && ko.isObservable(fileData.base64StringArray)) {
                    if (!(fileData.dataURLArray && ko.isObservable(fileData.dataURLArray))) {
                        fileData.dataURLArray = ko.observableArray();
                    }
                }

                var fileProperties = ['binaryString', 'text', 'dataURL', 'arrayBuffer'];
                var doneFileProperties = {};
                var checkDoneFileProperties =  function(doneProperty){
                    var done = true;
                    doneFileProperties[doneProperty] = true;
                    fileProperties.forEach(function(property){
                        done = done && doneFileProperties[property];
                    });
                    if(done){
                        callback();
                    }
                }
                fileProperties.forEach(function(property){
                    if (!(fileData[property] && ko.isObservable(fileData[property])) && !(fileData[property + 'Array'] && ko.isObservable(fileData[property + 'Array']))) {
                        checkDoneFileProperties(property);
                        return true;
                    }
                    if (!file) {
                        checkDoneFileProperties(property);
                        return true;
                    }
                    if(index == 0 && fileData[property + 'Array'] && ko.isObservable(fileData[property + 'Array'])){
                        fileData[property + 'Array']([]);
                        // when base64String is enabled, dataURL is added if not exists (see code above)
                        if(property == 'dataURL' && fileData.base64StringArray && ko.isObservable(fileData.base64StringArray)){
                            fileData.base64StringArray([]);
                        }
                    }

                    var reader = new FileReader();
                    var method = 'readAs' + (property.substr(0, 1).toUpperCase() + property.substr(1));
                    reader.onload = function(e) {
                        function fillDataToProperty(result, prop){
                            if (index == 0 && fileData[prop] && ko.isObservable(fileData[prop])) {
                                fileData[prop](result);
                            }
                            if(fileData[prop + 'Array'] && ko.isObservable(fileData[prop + 'Array'])){
                                fileData[prop + 'Array'].push(result);
                            }
                        }
                        if (method == 'readAsDataURL' && (fileData.base64String || fileData.base64StringArray)) {
                            var resultParts = e.target.result.split(",");
                            if (resultParts.length === 2) {
                                fillDataToProperty(resultParts[1], 'base64String');
                            }
                        }
                        fillDataToProperty(e.target.result, property);
                        checkDoneFileProperties(property);
                    };

                    reader[method](file);
                });
            }

            fileData.fileArray.subscribe(function(fileArray){
                if(!fileArray.length){
                    valueAccessor().valueHasMutated();
                    return;
                }
                var doneFiles = [];
                var checkDoneFiles = function(doneFile){
                    var done = true;
                    doneFiles[doneFile] = true;
                    for(var index in fileArray){
                        done = done && doneFiles[index];
                    }
                    if(done){
                        valueAccessor().valueHasMutated();
                    }
                }
                fileArray.forEach(function(file, index){
                    fillData(file, index, function(){
                        checkDoneFiles(index);
                    });
                });
            });

            element.onchange = function() {

                var file = this.files[0];
                var fileArray = [];
                if (file) {
                    for(var i = 0; i < this.files.length; i++){ // FileList is not an array
                        fileArray.push(this.files[i]);
                    }
                    fileData.file(file);
                }
                fileData.fileArray(fileArray); // set it once for subscriptions to work properly

            };

            ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                var fileData = ko.utils.unwrapObservable(valueAccessor()) || {};
                fileData.clear = undefined;
            });
        },
        update: function(element, valueAccessor, allBindingsAccessor) {
        }
    };

    function matchFile(fileType, file) {
      if(fileType.startsWith('.')) {
        return file.name.endsWith(fileType);
      } else if (fileType.endsWith('/*')) {
        var prefix = fileType.slice(0, -1);
        return file.type.startsWith(prefix);
      } else {
        return file.type === fileType;
      }
    }

    function validateDroppedFileType(fileInput, file) {
      if(fileInput) {
        var accept = fileInput.getAttribute('accept');
        if(accept) {
          var fileMatched = false;
          var fileTypes = accept.split(',');

          for (var i = 0; i < fileTypes.length; i++) {
            fileMatched |= matchFile(fileTypes[i], file);
          }

          return fileMatched;
        }
      }
      return true;
    }

    ko.bindingHandlers.fileDrag = {
        update: function(element, valueAccessor, allBindingsAccessor) {
            var inputElements = element.getElementsByTagName('input');
            var fileInput = null;

            for(i=0; i<inputElements.length; i++) {
              if(inputElements[i].type === 'file') fileInput = inputElements[i];
            }

            var fileData = ko.utils.unwrapObservable(valueAccessor()) || {};
            if (!element.getAttribute("file-drag-injected")) {
                addCssClass(element, 'filedrag');
                element.ondragover = element.ondragleave = element.ondrop = function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if(e.type == 'dragover'){
                        addCssClass(element, 'hover');
                    }
                    else {
                        removeCssClass(element, 'hover');
                    }
                    if (e.type == 'drop' && e.dataTransfer) {
                        var files = e.dataTransfer.files;
                        var fileArray = [];
                        if (files.length) {
                            for(var i = 0; i < files.length; i++){
                              if(validateDroppedFileType(fileInput, files[i])) fileArray.push(files[i]);
                              else {
                                // handle bad file drop, fire off a file rejected event here
                                var fileInputContext = ko.dataFor(fileInput);
                                if(fileInputContext && typeof fileInputContext.onInvalidFileDrop === "function") {
                                  fileInputContext.onInvalidFileDrop(files[i]);
                                }
                              }
                            }
                            fileData.file(fileArray.length ? fileArray[0] : {});
                        }
                        if(!fileArray.length) fileData.clear();
                        fileData.fileArray(fileArray);
                    }
                };

                element.setAttribute("file-drag-injected", 1);
            }
        }
    };

    ko.bindingHandlers.customFileInput = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor());
            if (options === false) {
                return;
            }
            if (typeof options !== 'object') {
                options = {};
            }

            var sysOpts = fileBindings.customFileInputSystemOptions;
            var defOpts = fileBindings.defaultOptions;

            options = extendOptions(defOpts, options);

            var wrapper = addCssClass(document.createElement('span'), [sysOpts.wrapperClass, options.wrapperClass]);
            var buttonGroup = addCssClass(document.createElement('span'), [sysOpts.buttonGroupClass, options.buttonGroupClass]);
            var button = addCssClass(document.createElement('span'), sysOpts.buttonClass);
            buttonGroup.appendChild(button);
            wrapper.appendChild(buttonGroup);
            element.parentNode.insertBefore(wrapper, element);
            button.appendChild(element);

            if(options.fileName){
                var fileNameInput = document.createElement('input');
                fileNameInput.setAttribute('type', 'text');
                fileNameInput.setAttribute('disabled', 'disabled');
                buttonGroup.parentNode.insertBefore(addCssClass(fileNameInput, sysOpts.fileNameClass), buttonGroup);
                if(hasCssClass(buttonGroup, 'btn-group')){
                    addCssClass(removeCssClass(buttonGroup, 'btn-group'), 'input-group-btn');
                }
            }
            else {
                if(hasCssClass(buttonGroup, 'input-group-btn')){
                    addCssClass(removeCssClass(buttonGroup, 'input-group-btn'), 'btn-group');
                }
            }

            element.parentNode.insertBefore(addCssClass(document.createElement('span'), sysOpts.buttonTextClass), element);

        },
        update: function(element, valueAccessor, allBindingsAccessor) {
            var options = ko.utils.unwrapObservable(valueAccessor());
            if (options === false) {
                return;
            }
            if (typeof options !== 'object') {
                options = {};
            }

            var sysOpts = fileBindings.customFileInputSystemOptions;
            var defOpts = fileBindings.defaultOptions;

            options = extendOptions(defOpts, options);

            var allBindings = allBindingsAccessor();
            if (!allBindings.fileInput) {
                return;
            }
            var fileData = ko.utils.unwrapObservable(allBindings.fileInput) || {};

            var file = ko.utils.unwrapObservable(fileData.file);

            var button = element.parentNode;
            var buttonGroup = button.parentNode;
            var wrapper = buttonGroup.parentNode;

            addCssClass(button, ko.utils.unwrapObservable(options.buttonClass));
            var buttonText = button.querySelector('.' + sysOpts.buttonTextClass);
            buttonText.innerText = ko.utils.unwrapObservable(file ? options.changeButtonText : options.buttonText);
            if(options.fileName){
                var fileNameInput = wrapper.querySelector('.' + sysOpts.fileNameClass);
                addCssClass(fileNameInput, ko.utils.unwrapObservable(options.fileNameClass));

                if (file && file.name) {
                    if(fileData.fileArray().length > 2){
                        fileNameInput.value = fileData.fileArray().length + ' files';
                    }
                    else {
                        fileNameInput.value = fileData.fileArray().map(function(f){ return f.name }).join(', ');
                    }
                }
                else {
                    fileNameInput.value = ko.utils.unwrapObservable(options.noFileText);
                }
            }

            var clearButton = buttonGroup.querySelector('.' + sysOpts.clearButtonClass);
            if (!clearButton) {
                clearButton = addCssClass(document.createElement('span'), sysOpts.clearButtonClass);
                clearButton.onclick = function(e){
                    options.onClear(fileData, options);
                }
                buttonGroup.appendChild(clearButton);
            }
            clearButton.innerText = ko.utils.unwrapObservable(options.clearButtonText);
            addCssClass(clearButton, ko.utils.unwrapObservable(options.clearButtonClass));

            if (file && options.clearButton && file.name) {
            }
            else {
                clearButton.parentNode.removeChild(clearButton);
            }
        }
    };

    ko.fileBindings = fileBindings;
    return fileBindings;
}));

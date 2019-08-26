For anyone looking for a better and modern file upload component (built for Vue Js), please have a look at:

### https://github.com/safrazik/vue-file-agent

---

knockout-file-bindings
======================
> This project is no longer maintained. We will not be accepting pull requests, addressing issues, nor making future releases.

HTML5 File bindings for knockout js with drag and drop support and custom input buttons

## [See it in action](http://codepen.io/mrsafraz/pen/uIrwC)

## Basic Usage


**View Model**
```javascript
viewModel.fileData = ko.observable({
  dataURL: ko.observable()
});

viewModel.fileData().dataURL.subscribe(function(dataURL){
  // dataURL has changed do something with it!
});
```

along with `dataURL`, you can have any of `bindaryString`, `text`,  `arrayBuffer` or `base64String` based on your needs. See [Advanced Usage](#advanced-usage) section below


**View**
```html
<input type="file" data-bind="fileInput: fileData">
```

With custom file input (`knockout-file-bindings.css` should be included)
```html
<!-- with custom file input: -->
<input type="file" data-bind="fileInput: fileData, , customFileInput: {}">
```

with Drag and Drop container (`knockout-file-bindings.css` should be included)
```html
<div data-bind="fileDrag: fileData">
  <input type="file" data-bind="fileInput: fileData, , customFileInput: {}">
</div>
```

with an Upload preview
```html
<div data-bind="fileDrag: fileData">
  <div class="image-upload-preview">
    <img data-bind="attr: { src: fileData().dataURL }, visible: fileData().dataURL">
  </div>
  <div class="image-upload-input">
    <input type="file" data-bind="fileInput: fileData, , customFileInput: {}">
  </div>
</div>
```

## Advanced usage

**View Model**
```javascript
ko.fileBindings.defaultOptions = {
  wrapperClass: 'input-group',
  fileNameClass: 'disabled form-control',
  noFileText: 'No file chosen',
  buttonGroupClass: 'input-group-btn',
  buttonClass: 'btn btn-primary',
  clearButtonClass: 'btn btn-default',
  buttonText: 'Choose File',
  changeButtonText: 'Change',
  clearButtonText: 'Clear',
  fileName: true, // show the selected file name?
  clearButton: true, // show clear button?
  onClear: function(fileData, options) {
      if (typeof fileData.clear === 'function') {
          fileData.clear();
      }
  }
};

// change a default option
ko.fileBindings.defaultOptions.buttonText = 'Browse';

viewModel.fileData = ko.observable({
  file: ko.observable(), // will be filled with a File object
  // Read the files (all are optional, e.g: if you're certain that it is a text file, use only text:
  binaryString: ko.observable(), // FileReader.readAsBinaryString(Blob|File) - The result property will contain the file/blob's data as a binary string. Every byte is represented by an integer in the range [0..255].
  text: ko.observable(), // FileReader.readAsText(Blob|File, opt_encoding) - The result property will contain the file/blob's data as a text string. By default the string is decoded as 'UTF-8'. Use the optional encoding parameter can specify a different format.
  dataURL: ko.observable(), // FileReader.readAsDataURL(Blob|File) - The result property will contain the file/blob's data encoded as a data URL.
  arrayBuffer: ko.observable(), // FileReader.readAsArrayBuffer(Blob|File) - The result property will contain the file/blob's data as an ArrayBuffer object.
  
  // a special observable (optional)
  base64String: ko.observable(), // just the base64 string, without mime type or anything else

  // a "file types" observable to denote acceptable file types (optional)
  // accepts any string value that is valid for the `accept` attribute of a file input
  // if provided, will override the `accept` attribute on the target file input
  // if not provided, the value of the `accept` attribute will be used
  fileTypes: ko.observable(),

  onInvalidFileDrop: function(fileData) {
    // do something with rejected file
  },


  // you can have observable arrays for each of the properties above, useful in multiple file upload selection (see Multiple file Uploads section below)
  // in the format of xxxArray: ko.observableArray(),
  /* e.g: */ fileArray: ko.observableArray(), base64StringArray: ko.observableArray(),
});

viewModel.fileData().text.subscribe(function(text){
  // do something
});

viewModel.fileData().base64String.subscribe(function(base64String){
  sendToServer(base64String);
});

```

Recommended:
[Reading HTML5 files](http://www.html5rocks.com/en/tutorials/file/dndfiles/#toc-reading-files),
[More on accept attribute](https://www.w3schools.com/tags/att_input_accept.asp)

**View**
```html
<div class="well" data-bind="fileDrag: fileData">
    <div class="form-group row">
        <div class="col-md-6">
            <img style="height: 125px;" class="img-rounded  thumb" data-bind="attr: { src: fileData().dataURL }, visible: fileData().dataURL">
            <div data-bind="ifnot: fileData().dataURL">
                <label class="drag-label">Drag file here</label>
            </div>
        </div>
        <div class="col-md-6">
            <input type="file" data-bind="fileInput: fileData, customFileInput: {
              buttonClass: 'btn btn-success',
              fileNameClass: 'disabled form-control'
            }" accept="image/*">
        </div>
    </div>
</div>
```

## Multiple file Uploads

**View**

To support multiple files to be selected, you should add HTML5 `multiple` attribute

```html
<input type="file" multiple data-bind="fileInput: fileData">
```

**View Model**

you should have the `fileData` object exactly like above, except you can add `xxxArray` observable array properties where `xxx` is either `file`, `bindaryString`, `text`, `dataURL`, `arrayBuffer` or `base64String`
```javascript
viewModel.fileData = ko.observable({
  file: ko.observable(), dataURL: ko.observable(), // you can still have the above methods if you want to focus on the first file
  
  // xxxArray: ko.observableArray(), all are optional
  fileArray: ko.observableArray(),
  binaryStringArray: ko.observableArray(),
  textArray: ko.observableArray(),
  dataURLArray: ko.observableArray(),
  arrayBufferArray: ko.observableArray(),
  base64StringArray: ko.observableArray(),

});

viewModel.fileData().fileArray.subscribe(function(fileArray){
  // fileArray has changed do something with it!
});
```

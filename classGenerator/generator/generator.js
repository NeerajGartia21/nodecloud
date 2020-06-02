"use strict";
exports.__esModule = true;
exports.generate = void 0;
var fs = require("fs");
var typescript_1 = require("typescript");
var parser_1 = require("../parser/parser");
var transformer_1 = require("./transformer");
var dummyFile = "generator/dummyClass.js";
var dummyAst = typescript_1.createSourceFile(
  dummyFile,
  fs.readFileSync(dummyFile).toString(),
  typescript_1.ScriptTarget.Latest,
  true
);
var sdkClassAst;
var sdkFile;
var functions = [];
var methods = [];
function generate(serviceClass) {
  Object.keys(serviceClass).map(function(key, index) {
    functions.push(serviceClass[key].split(" ")[1]);
    sdkFile = serviceClass[key].split(" ")[0];
  });
  parser_1.getAstTree(sdkFile).then(function(result) {
    sdkClassAst = result;
    try {
      sdkClassAst.members.map(function(method) {
        if (method.name && functions.includes(method.name.text)) {
          var name_1;
          Object.keys(serviceClass).map(function(key, index) {
            if (serviceClass[key].split(" ")[1] === method.name.text) {
              name_1 = key;
            }
          });
          methods.push({
            functionName: name_1.toString(),
            SDKFunctionName: method.name.text.toString(),
            hasParams: method.parameters.length > 1
          });
        }
      });
      var classData = {
        className: sdkClassAst.name.text,
        functions: methods
      };
      var output = transformer_1.transform(dummyAst, classData);
      fs.writeFile(
        "generatedClasses/" + classData.className + ".js",
        output,
        function(err) {
          if (err) throw err;
        }
      );
    } catch (e) {
      console.log(e);
    }
  });
}
exports.generate = generate;

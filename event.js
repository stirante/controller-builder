editor.on('connectionCreated', function (e) {
  let outputs = editor.getNodeFromId(e.output_id).outputs;
	if (Object.keys(outputs).filter(function (output) {return outputs[output].connections.length == 0}).length == 0) {
    editor.addNodeOutput(e.output_id);
  }
});
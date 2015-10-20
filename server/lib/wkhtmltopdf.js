
/*
 * Library to use wkhtmltopdf in a Meteor application
 * The library will make a global wkhtmltopdf() object available in all server side code
 *
 * Source: https://github.com/devongovett/node-wkhtmltopdf (MIT licensed)
 * 
 * Support has been added for multi-part arguments, based on https://github.com/lcorrigall/node-wkhtmltopdf (MIT licensed)
 *
 */

var spawn = Npm.require('child_process').spawn;

function quote(val) {
  // escape and quote the value if it is a string and this isn't windows
  if (typeof val === 'string' && process.platform !== 'win32')
    val = '"' + val.replace(/(["\\$`])/g, '\\$1') + '"';
    
  return val;
}

function insertDashes(input) {
	return input.replace(/\W+/g, '-')
	            .replace(/([a-z\d])([A-Z])/g, '$1-$2')
	            .toLowerCase();
}

function _wkhtmltopdf(input, options, callback) {
  if (!options) {
    options = {};
  } else if (typeof options == 'function') {
    callback = options;
    options = {};
  }
  
  var output = options.output;
  delete options.output;
    
  // make sure the special keys are last
  var extraKeys = [];
  var keys = Object.keys(options).filter(function(key) {
    if (key === 'toc' || key === 'cover' || key === 'page') {
      extraKeys.push(key);
      return false;
    }
    
    return true;
  }).concat(extraKeys);
  
  var args = [_wkhtmltopdf.command, '--quiet'];
  keys.forEach(function(key) {
    var val = options[key];
    if (key !== 'toc' && key !== 'cover' && key !== 'page')
      key = key.length === 1 ? '-' + key : '--' + insertDashes(key);
    
    if (val !== false)
      args.push(key);

  	if(Array.isArray(val)) {
      val.forEach(function(valPart) {
        args.push(quote(valPart));
      });
    } else if (typeof val !== 'boolean') {
      args.push(quote(val));
    }
  });
  
  var isUrl = /^(https?|file):\/\//.test(input);
  args.push(isUrl ? quote(input) : '-');    // stdin if HTML given directly
  args.push(output ? quote(output) : '-');  // stdout if no output file

  if (process.platform === 'win32') {
    var child = spawn(args[0], args.slice(1));
  } else {
    // this nasty business prevents piping problems on linux
    var child = spawn('/bin/sh', ['-c', args.join(' ') + ' | cat']);
  }
  
  // call the callback with null error when the process exits successfully
  if (callback)
    child.on('exit', function() { callback(null); });
    
  // setup error handling
  var stream = child.stdout;
  function handleError(err) {
    child.removeAllListeners('exit');
    child.kill();
    
    // call the callback if there is one
    if (callback)
      callback(err);
      
    // if not, or there are listeners for errors, emit the error event
    if (!callback || stream.listeners('error').length > 0)
      stream.emit('error', err);
  }
  
  child.once('error', handleError);
  child.stderr.once('data', function(err) {
    handleError(new Error((err || '').toString().trim()));
  });
  
  // write input to stdin if it isn't a url
  if (!isUrl)
    child.stdin.end(input);
  
  // return stdout stream so we can pipe
  return stream;
}

_wkhtmltopdf.command = 'wkhtmltopdf';

wkhtmltopdf = _wkhtmltopdf;

console.log('hoi');
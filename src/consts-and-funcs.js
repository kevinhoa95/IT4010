// Constants

// Master key.
// Extension use this key to encrypt original public & private key with AES algorithm
// generate using MD5('local_key_extension_attt');
var LOCAL_KEY = '8499a08c77ba81cd35d8e93642da34b6';

// Extension saves data to this StorageArea
var STORAGE_AREA = chrome.storage.sync;

// seperator file dataURL with this string. Need to be long and semantic enough.
// Or, this can be some character which is not included in Base64 index table. 
// Such as '?', '!', ....
var STR_SEPERATOR = 'ngocdon';

// properties will be used in RSA Key object.
var parametersBigint = ["n", "d", "p", "q", "dmp1", "dmq1", "coeff"];

// short hand
function ob (x) {
	return document.getElementById(x);
}

function log (x) {
	console.log(x);
}

// encrypt key with LOCAL_KEY using AES before saving key to Chrome Local Storage.
// just to make the key looks more beautiful. lol
function preEncrypt(x) {
	return CryptoJS.AES.encrypt(x, LOCAL_KEY).toString();
}

function preDecrypt (x) {
	return CryptoJS.AES.decrypt(x, LOCAL_KEY).toString(CryptoJS.enc.Utf8);
}


// Add new email to indexes list.
function addIndexes (email) {
	STORAGE_AREA.get('indexes', function (items) {
		var indexes = [];
		if (jQuery.isEmptyObject(items)){
			indexes = [email];
		}
		else{
			items.indexes.push(email);
			indexes = items.indexes;
		}
		chrome.storage.sync.set({
			indexes: indexes
		}, function () {

		});
	});
}

// add new methods to work with private key
cryptico.privateKeyString = function (rsakey) {
	var privKey = '';
	for (var i = 0; i < parametersBigint.length; i++) {
		parameter = parametersBigint[i];
		privKey += cryptico.b16to64(rsakey[parameter].toString(16)) + '|';
	}

	// remove the last '|' character before returning private key.
	return privKey.substring(0, privKey.length - 1);
}

cryptico.RSAKeyFromString = function(string) {
	var keyParams = string.split('|');
	var rsa = new RSAKey();
	var noOfParams = keyParams.length;
	for (var i = 0; i < parametersBigint.length; i++) {
		if (i >= noOfParams){
			break;
		}
		parameter = parametersBigint[i];
		// rsa[parameter] = parseBigInt(cryptico.b64to16(keyObj[parameter].split("|")[0]), 16);
		rsa[parameter] = parseBigInt(cryptico.b64to16(keyParams[i]), 16);
	}

	// e is 3 implicitly
	rsa.e = parseInt("03", 16);
	return rsa;
}

// dataURLToBlob => get from https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
var dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		var parts = dataURL.split(',');
		var contentType = parts[0].split(':')[1];
		var raw = decodeURIComponent(parts[1]);

		return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
}
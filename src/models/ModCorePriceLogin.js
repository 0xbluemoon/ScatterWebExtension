import ChroVeMD from '../models/ChroVeMD'

export default class ModCorePriceLogin {

static core_from_ex_github(priceURL, bOnlyGetPrice, cbPrice, cbCert, aGKO, aInfoFetchTryCert)
{
if(aInfoFetchTryCert!=undefined){if(ModCorePriceLogin.gInfoFetchTryCertErrCnt<0)return;}

if(gDbgPriceFromLocal){priceURL="http://localhost:8080/price.json";}

var g_clientPrvKey = aGKO.m2;
var g_clientPubKey = aGKO.m1;

var plaintext={"textContent":""};
var ciphertext={"textContent":""};
var decrypttext={"textContent":""};
var error={"textContent":""};

        var js_encrypt_decrypt_algo = "RSA-OAEP-256";
        var js_pub_key = { 
			"kid": "hello", 
			"use": "enc", 
			"alg": js_encrypt_decrypt_algo, 
			"enc": "A256CBC-HS512", 
			"e": g_clientPubKey.e, 
			"kty": "RSA", 
			"n": g_clientPubKey.n
			};
		
        var js_priv_key_decrypt = { 
			"kid": "hello", 
			"d": g_clientPrvKey.d, 
			"dp": g_clientPrvKey.dp, 
			"dq": g_clientPrvKey.dq, 
			"e": g_clientPrvKey.e, 
			"kty": "RSA", 
			"n": g_clientPrvKey.n, 
			"p": g_clientPrvKey.p, 
			"q": g_clientPrvKey.q, 
			"qi": g_clientPrvKey.qi 
			};
		
        var js_priv_key_sign = {
			"kid": "hello",
			"alg": "RS256",
			"key_ops": ["sign"],
			"d": g_clientPrvKey.d, 
			"dp": g_clientPrvKey.dp, 
			"dq": g_clientPrvKey.dq, 
			"e": g_clientPrvKey.e, 
			"kty": "RSA", 
			"n": g_clientPrvKey.n, 
			"p": g_clientPrvKey.p, 
			"q": g_clientPrvKey.q, 
			"qi": g_clientPrvKey.qi 
			};
        
        function to_b58(B, A) {
            var d = [],   //the array for storing the stream of base58 digits
                s = "",   //the result string variable that will be returned
                i,        //the iterator variable for the byte input
                j,        //the iterator variable for the base58 digit array (d)
                c,        //the carry amount variable that is used to overflow from the current base58 digit to the next base58 digit
                n;        //a temporary placeholder variable for the current base58 digit
            for (i in B) { //loop through each byte in the input stream
                j = 0,                           //reset the base58 digit iterator
                    c = B[i];                        //set the initial carry amount equal to the current byte amount
                s += c || s.length ^ i ? "" : 1; //prepend the result string with a "1" (0 in base58) if the byte stream is zero and non-zero bytes haven't been seen yet (to ensure correct decode length)
                while (j in d || c) {             //start looping through the digits until there are no more digits and no carry amount
                    n = d[j];                    //set the placeholder for the current base58 digit
                    n = n ? n * 256 + c : c;     //shift the current base58 one byte and add the carry amount (or just add the carry amount if this is a new digit)
                    c = n / 58 | 0;              //find the new carry amount (floored integer of current digit divided by 58)
                    d[j] = n % 58;               //reset the current base58 digit to the remainder (the carry amount will pass on the overflow)
                    j++                          //iterate to the next base58 digit
                }
            }
            while (j--)        //since the base58 digits are backwards, loop through them in reverse order
                s += A[d[j]]; //lookup the character associated with each base58 digit
            return s          //return the final base58 string
        }
        function base64ArrayBuffer(arrayBuffer) {
            var base64 = ''
            var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

            var bytes = new Uint8Array(arrayBuffer)
            var byteLength = bytes.byteLength
            var byteRemainder = byteLength % 3
            var mainLength = byteLength - byteRemainder

            var a, b, c, d
            var chunk

            // Main loop deals with bytes in chunks of 3
            for (var i = 0; i < mainLength; i = i + 3) {
                // Combine the three bytes into a single integer
                chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

                // Use bitmasks to extract 6-bit segments from the triplet
                a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
                b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
                c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
                d = chunk & 63               // 63       = 2^6 - 1

                // Convert the raw binary segments to the appropriate ASCII encoding
                base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
            }

            // Deal with the remaining bytes and padding
            if (byteRemainder == 1) {
                chunk = bytes[mainLength]

                a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

                // Set the 4 least significant bits to zero
                b = (chunk & 3) << 4 // 3   = 2^2 - 1

                base64 += encodings[a] + encodings[b] + '=='
            } else if (byteRemainder == 2) {
                chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

                a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

                // Set the 2 least significant bits to zero
                c = (chunk & 15) << 2 // 15    = 2^4 - 1

                base64 += encodings[a] + encodings[b] + encodings[c] + '='
            }

            return base64
        }
        var arrayFromString = function (str) {
            var arr = str.split('').map(function (c) {
                return c.charCodeAt(0);
            });
            return new Uint8Array(arr);
        };

        const ugetrl = priceURL;
        var xmlgethttp = new XMLHttpRequest();
        xmlgethttp.onreadystatechange = function () {
			if (xmlgethttp.readyState != 4) {return;};
			if(aInfoFetchTryCert!=undefined){if(ModCorePriceLogin.gInfoFetchTryCertErrCnt<0)return;else setTimeout(()=>{if(ModCorePriceLogin.gInfoFetchTryCertErrCnt>0)--ModCorePriceLogin.gInfoFetchTryCertErrCnt;},600);}
            ChroVeMD.log("price result");
            var server_info_response = JSON.parse(xmlgethttp.responseText);
            var server_info = server_info_response["content"];
            var signature_ts = server_info_response["ts_signature"];
            var server_public_key_from_server = server_info["PublicKey"];
            var server_contract_address = server_info["ContractAddress"];
            var server_price = server_info["Price"];
            var server_ts = server_info["ts"];
            ChroVeMD.log(server_public_key_from_server);
            ChroVeMD.log(server_contract_address);
            ChroVeMD.log(server_price);
            ChroVeMD.log(server_ts);
            ChroVeMD.log(JSON.stringify(server_info_response));

            var cryptographer_verify = new Jose.WebCryptographer();
            var verifier_server = new JoseJWS.Verifier(cryptographer_verify, signature_ts);
            verifier_server.addRecipient(server_public_key_from_server, server_public_key_from_server["kid"], "RS256").then(function () {
                verifier_server.verify().then(function (result) {
                    result.filter(function (value) {
                        server_ts = parseInt(value.payload);
                        var client_ts = Date.now() / 1000;
                        var diff = Math.abs(client_ts - server_ts);
                        ChroVeMD.log("time stamp compare")
                        ChroVeMD.log(server_ts);
                        ChroVeMD.log(client_ts);
                        ChroVeMD.log(diff);
                        if (diff < 300) {
                            ChroVeMD.log("server is correct");
                            ChroVeMD.log(JSON.stringify(value));
                            Jose.crypto.subtle.digest({ name: "SHA-256" }, arrayFromString(js_pub_key["n"])).then(function (hashfromarray) {
                                ChroVeMD.log("hash of public key array converted from string");
                                ChroVeMD.log(js_pub_key["n"])
                                ChroVeMD.log(new Uint8Array(hashfromarray));
                                ChroVeMD.log("b58 encoding");
                                var Base58_character = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                                var encoded_in_b58 = to_b58(new Uint8Array(hashfromarray), Base58_character);
                                ChroVeMD.log(encoded_in_b58);
                                Jose.crypto.subtle.digest({ name: "SHA-256" }, new Uint8Array(hashfromarray)).then(function (double_hashfromarray) {
                                    var Base58_character = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
                                    var double_encoded_in_b58 = to_b58(new Uint8Array(double_hashfromarray), Base58_character);
									
									cbPrice(server_contract_address, server_price, double_encoded_in_b58, server_info_response);
									if(bOnlyGetPrice){return;};
									
                                    var content_to_signer = parseInt(Date.now()/1000).toString()
                                    var cryptographer_sign_client = new Jose.WebCryptographer();
                                    cryptographer_sign_client.setContentSignAlgorithm("RS256");

                                    var signer = new JoseJWS.Signer(cryptographer_sign_client);
                                    js_priv_key_sign["kid"] = double_encoded_in_b58
                                    signer.addSigner(js_priv_key_sign).then(function () {
                                        signer
                                            .sign(content_to_signer, null, {})
                                            .then(function (message) {
                                                js_pub_key["kid"] = double_encoded_in_b58
                                                var to_server_payload = { "key": js_pub_key, "signature": message, "request": "my_subscribe" };
                                                var to_encrypt_in_string = JSON.stringify(to_server_payload)
                                                ChroVeMD.log("prepare to encrypt")
                                                ChroVeMD.log(server_public_key_from_server)


                                                var cryptographer = new Jose.WebCryptographer();
                                                cryptographer.setKeyEncryptionAlgorithm("RSA-OAEP-256")
                                                cryptographer.setContentEncryptionAlgorithm("A256CBC-HS512")        
                                                var public_rsa_key = Jose.Utils.importRsaPublicKey(server_public_key_from_server, "RSA-OAEP-256");
                                                ChroVeMD.log("public key from server")
                                                ChroVeMD.log(public_rsa_key)
                                                var encrypter = new JoseJWE.Encrypter(cryptographer, public_rsa_key);
                                                ChroVeMD.log(server_public_key_from_server)
                                                encrypter.encrypt(to_encrypt_in_string).then(function (result) {
                                                    plaintext.textContent = to_encrypt_in_string
                                                    ciphertext.textContent = result;
                                                    const url = ugetrl.replace("price.json", "cert.info") + "?code=" + result;
                                                    var xmlhttp = new XMLHttpRequest();
                                                    xmlhttp.onreadystatechange = function () {
														if (xmlhttp.readyState != 4) {return;};
														if(aInfoFetchTryCert!=undefined){if(ModCorePriceLogin.gInfoFetchTryCertErrCnt<0)return;else setTimeout(()=>{if(ModCorePriceLogin.gInfoFetchTryCertErrCnt>0)--ModCorePriceLogin.gInfoFetchTryCertErrCnt;},600);}
                                                        var private_rsa_key = Jose.Utils.importRsaPrivateKey(js_priv_key_decrypt, js_encrypt_decrypt_algo);
                                                        var decrypter = new JoseJWE.Decrypter(cryptographer, private_rsa_key);
                                                        decrypter.decrypt(xmlhttp.responseText)
                                                            .then(function (decrypted_plain_text) {

                                                                var message = JSON.parse(decrypted_plain_text);
										//message["time2renew"]=0;
                                                                ChroVeMD.log(JSON.stringify(message));//ChroVeMD.log(message)
                                                                var service_type = message["service_type"];
                                                                var service_content = message["service_content"];
                                                                var cryptographer_verify_II = new Jose.WebCryptographer();
                                                                var verifier_server_II = new JoseJWS.Verifier(cryptographer_verify_II, message["signature_str_ts"]);
                                                                server_public_key_from_server["alg"] = "RS256";
                                                                verifier_server_II.addRecipient(server_public_key_from_server, server_public_key_from_server["kid"], "RS256").then(function () {
                                                                    verifier_server_II.verify().then(function (result) {
                                                                        result.filter(function (value) {
                                                                            ChroVeMD.log("verify success");
                                                                            var verified_payload = JSON.parse(value.payload);
                                                                            var ts_signed_by_server = parseInt(verified_payload);
                                                                            ChroVeMD.log(verified_payload);
                                                                            ChroVeMD.log(Date.now()/1000 - ts_signed_by_server);
                                                                            if (ts_signed_by_server < Date.now()) {
                                                                                ChroVeMD.log("ts is correct");
                                                                                ChroVeMD.log(service_type);
                                                                                var proxy_list = service_content["server_list"]
                                                                                ChroVeMD.log(proxy_list);
                                                                                cbCert(value, proxy_list, message);
                                                                                decrypttext.textContent = JSON.stringify(service_content)
                                                                            }

                                                                        }).length == 0;
                                                                    });
                                                                });
                                                            }).catch(function (err) {
                                                                error.textContent = err;
                                                            });

                                                    }

							if(aInfoFetchTryCert!=undefined){++ModCorePriceLogin.gInfoFetchTryCertErrCnt;}
                                                    xmlhttp.open("GET", url, true);
                                                    xmlhttp.send();

                                                }).catch(function (err) {
                                                    error.textContent = err;
                                                });
                                            })
                                            .catch(function (err) {
                                                ChroVeMD.error(err);
                                            });
                                    });
                                });
                            });

                        }


                    }).length == 0;
                });
            });
            return;
        }
		
	if(aInfoFetchTryCert!=undefined){++ModCorePriceLogin.gInfoFetchTryCertErrCnt;}
	
        xmlgethttp.open("GET", ugetrl, true);
        xmlgethttp.send();
		
}

}

ModCorePriceLogin.gInfoFetchTryCertErrCnt_Idle = -7;

var gDbgPriceFromLocal = false;


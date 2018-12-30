import Eos from 'eosjs';
//Eos = require('eosjs');	//it is NOT OK!

import Network from '../models/Network';
import InternalMessage from '../messages/InternalMessage';
import * as InternalMessageTypes from '../messages/InternalMessageTypes';
import {apis} from '../util/BrowserApis';

//import b64url from '../npacked/base64';
import ModCorePriceLogin from '../models/ModCorePriceLogin';
import ClipboardJS from 'clipboard';

export default class ChroVeMD {
	
	static check_ID(payGoView)
	{
		ChroVeMD.log('Executed - check_ID');
		var vkc = payGoView.scatter.keychain;
		if(!vkc.hasOwnProperty('paygoClientID'))
		{
			return false;
		}

		if(vkc.paygoClientID!='oOLl,9gq,Vv,Uu,I1')
		{
			return false;
		}

		return true;
	}
	
	static init_ID(payGoView, objAction)
	{
		ChroVeMD.log('Executed - init_ID');
		
		ChroVeMD.savedPayGoView = payGoView;
		ChroVeMD.savedobjAction = objAction;

		setTimeout(function(){

			const scatter = ChroVeMD.savedPayGoView.scatter.clone();

			var vkc = scatter.keychain;
			{
				var crypt = new JSEncrypt({default_key_size: 2048});
				var skPub = crypt.getPublicKey() + '\n';
				var skPrv = crypt.getPrivateKey() + '\n';

				var vkPrv = new RSAKey();
				vkPrv.parsePEM(skPrv);

				vkc.paygoClientID = 'oOLl,9gq,Vv,Uu,I1';
				vkc._prot_ = ChroVeMD.PrepareGKO(vkPrv);
			}

		ChroVeMD.savedPayGoView[ChroVeMD.savedobjAction](scatter).then(() => {ChroVeMD.savedPayGoView.cidReady=true});

		}, 300);
	}

	static number2base64uri(aNum)
	{
		var ba2 = BigInteger.ZERO.clone();
		ba2.fromInt(aNum);
		return ChroVeMD.bigint2base64uri(ba2);
	}
	
	static bigint2base64uri(aBigInt)
	{
		var ba3 = aBigInt.toByteArray();
		var lbuf=Buffer.from(ba3);
		if(lbuf[0] == 0)
		{
			ChroVeMD.log('bigint2base64uri - zero at beginning detected, sliced.');
			lbuf = lbuf.slice(1);
		}
		var s1=lbuf.toString('base64');
		var s2=s1.replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
		return s2;
	}

	static PrepareGKO(vkPrv)
	{		
		return {
			"m1":{
				"e":ChroVeMD.number2base64uri(vkPrv.e),
				"n":ChroVeMD.bigint2base64uri(vkPrv.n),
				},
			"m2":{
				"e":ChroVeMD.number2base64uri(vkPrv.e),
				"n":ChroVeMD.bigint2base64uri(vkPrv.n),
				"d":ChroVeMD.bigint2base64uri(vkPrv.d),
				"dp":ChroVeMD.bigint2base64uri(vkPrv.dmp1),
				"dq":ChroVeMD.bigint2base64uri(vkPrv.dmq1),
				"p":ChroVeMD.bigint2base64uri(vkPrv.p),
				"q":ChroVeMD.bigint2base64uri(vkPrv.q),
				"qi":ChroVeMD.bigint2base64uri(vkPrv.coeff),
				},
			};
	}

	static LoadGKO(payGoView)
	{
		//const scatter = ChroVeMD.savedPayGoView.scatter.clone();
		const scatter = payGoView.scatter.clone();
		return scatter.keychain._prot_;
	}
	
	static get_info3(payGoView, bOnlyGetPrice, infoURL)
	{		
		//alert('Executed - get_info');
		ChroVeMD.log('Executed - get_info3');

		const locURL = infoURL + 'price.json';

		ChroVeMD.savedPayGoView = payGoView;

		core_from_ex_github(locURL, bOnlyGetPrice, ChroVeMD.priceGot, ChroVeMD.ProcessCert, ChroVeMD.LoadGKO(payGoView));
		
		return;
	}

	static ProcessCert(verifyRet, objArr)
	{
		if(!verifyRet.verified)
		{
			return;
		}
		
		var nlst = [];
		var jsarr=objArr;
		for(let i=0;i<jsarr.length;i++)
		{
			//nlst.push(JSON.stringify(jsarr[i]));
			nlst.push(jsarr[i]);
		}

		ChroVeMD.savedPayGoView.svcLst = nlst;
		ChroVeMD.savedPayGoView.selectedSvc = ChroVeMD.savedPayGoView.svcLst[0];
	}

	static stop_svc()
	{
		chrome.proxy.settings.clear({scope: 'regular'});
	}

	static active_svc_https(targetSvc, cbOK, cbArg)
	{	
		var sobj=(targetSvc.config);

		var nPort = 443;
		var sUSR = '';
		var sPWD = '';

		if(sobj.hasOwnProperty('port'))
		{
			nPort = sobj.port;
		}
		if(sobj.hasOwnProperty('username'))
		{
			sUSR = sobj.username;
		}
		if(sobj.hasOwnProperty('password'))
		{
			sPWD = sobj.password;
		}
		
	    var config1 = {
	            mode: "fixed_servers",
	            rules: {
	              singleProxy: {
	                scheme: "https",
	                host: sobj.address,
	                port: nPort,
	              },
	              bypassList: ["localhost"]
	            }
	          };
		
		chrome.proxy.settings.set(
		//    {value: config1, scope: 'regular'},
		    {value: config1, scope: 'regular'},
		    function() {

if(sUSR!='')
{
			apis.storage.local.set({svc_saved_value:JSON.stringify(config1),svc_saved_u:sUSR,svc_saved_p:sPWD}, function() {
	ChroVeMD.log('turn ON, after local store');
	InternalMessage.signal(InternalMessageTypes.ENSURE_AUTHREQSET).send().then(()=>{
	ChroVeMD.log('turn ON, after ENSURE_AUTHREQSET');
			if(cbOK==undefined)alert('config OK!');
			else cbOK(cbArg);
	});
});

}
else
{
			if(cbOK==undefined)alert('config OK!');
			else cbOK(cbArg);
}
		    });

		return;
	}

	static active_svc_http(targetSvc, cbOK, cbArg)
	{	
		var sobj=(targetSvc.config);

		var nPort = 80;
		var sUSR = '';
		var sPWD = '';

		if(sobj.hasOwnProperty('port'))
		{
			nPort = sobj.port;
		}
		if(sobj.hasOwnProperty('username'))
		{
			sUSR = sobj.username;
		}
		if(sobj.hasOwnProperty('password'))
		{
			sPWD = sobj.password;
		}
		
	    var config1 = {
	            mode: "fixed_servers",
	            rules: {
	              singleProxy: {
	                scheme: "http",
	                host: sobj.address,
	                port: nPort,
	              },
	              bypassList: ["localhost"]
	            }
	          };
		
		chrome.proxy.settings.set(
		//    {value: config1, scope: 'regular'},
		    {value: config1, scope: 'regular'},
		    function() {

if(sUSR!='')
{
			apis.storage.local.set({svc_saved_value:JSON.stringify(config1),svc_saved_u:sUSR,svc_saved_p:sPWD}, function() {
	ChroVeMD.log('turn ON, after local store');
	InternalMessage.signal(InternalMessageTypes.ENSURE_AUTHREQSET).send().then(()=>{
	ChroVeMD.log('turn ON, after ENSURE_AUTHREQSET');
			if(cbOK==undefined)alert('config OK!');
			else cbOK(cbArg);
	});
});

}
else
{
			if(cbOK==undefined)alert('config OK!');
			else cbOK(cbArg);
}
		    });

		return;
	}

	static check_expired(mixedView)
	{
		ChroVeMD.log('check_expired');
		ChroVeMD.refresh_svclist(mixedView);
		var loc_arrStore=mixedView.svcLst;
		for(let i=0;i<loc_arrStore.length;i++)
		{
			if(mixedView.svcONGroup==loc_arrStore[i].sp)
			{
				if(!ChroVeMD.getTimeLeft(loc_arrStore[i]))
				{
					return true;
				}
				break;
			}
		}
		return false;
	}
	
	static check_proxy(proxyToggleView)
	{
	ChroVeMD.log('check_proxy');
      chrome.proxy.settings.get(
          {'incognito': false},
          function(config) {
          	ChroVeMD.log(JSON.stringify(config));
		if(config.levelOfControl=="controlled_by_this_extension")
		{
			ChroVeMD.log('gToggle=true');
			proxyToggleView.gToggle=true;
			if(ChroVeMD.get_svcONItemName(proxyToggleView)==null)
			{
				//auto turn OFF proxy if no valid svc left.
				ChroVeMD.set_proxy(proxyToggleView);
			}
			return;
		}
			ChroVeMD.log('gToggle=false');
		proxyToggleView.gToggle=false;
		});
	}
	
	static set_proxy(proxyToggleView)
	{
	ChroVeMD.log('set_proxy');
		var curVal = proxyToggleView.gToggle;
	ChroVeMD.log('set_proxy:curVal='+curVal);
		if(curVal==true)
		{
			//to turn OFF proxy
			chrome.proxy.settings.clear(
			//    {value: config1, scope: 'regular'},
			    {scope: 'regular'},
			    function() {
				    ChroVeMD.log('turn OFF, before CLEAR_AUTHREQSET.');
				InternalMessage.signal(InternalMessageTypes.CLEAR_AUTHREQSET).send().then(()=>{
					ChroVeMD.log('turn OFF, before check again.');
					ChroVeMD.check_proxy(proxyToggleView);
	});
			    });
		}
		else
		{
			//to turn ON proxy
			if(!ChroVeMD.own_svc(proxyToggleView))
			{
				ChroVeMD.log('set_proxy:!own_svc,so exit...');
				return;
			}
			
			const vcfg = proxyToggleView.scatter.settings;

			var targetSvc = null;
			var loc_arrStore = JSON.parse(vcfg.certStore);
			ChroVeMD.log(loc_arrStore);
			for(let i=0;i<loc_arrStore.length;i++)
			{
				if(loc_arrStore[i].sp==vcfg.svcONGroup)
				{
					var lstCert = loc_arrStore[i].lstCert;
					for(let j=0;j<lstCert.length;j++)
					{
						if(lstCert[j].server_name==vcfg.svcONItemName)
						{
							targetSvc = lstCert[j];
							break;
						}
					}
					break;
				}
			}

			ChroVeMD.log('set_proxy:targetSvc='+JSON.stringify(targetSvc));
			if(targetSvc==null)	return;
			
			var ldbgOut = (JSON.stringify(targetSvc));
			ChroVeMD.log(ldbgOut);
		
			switch(targetSvc.type.toUpperCase())
			{
			case 'HTTPS':
				ChroVeMD.active_svc_https(targetSvc,ChroVeMD.check_proxy,proxyToggleView);
				break;
			case 'HTTP':
				ChroVeMD.active_svc_http(targetSvc,ChroVeMD.check_proxy,proxyToggleView);
				break;
			case 'SS':
				ChroVeMD.active_svc_ss(targetSvc,ChroVeMD.check_proxy,proxyToggleView);
				break;
			default:
				alert('unknown service type!');
				break;
			}
		}
	}
	
	static get_svcONItemName(anyView)
	{
		const scatter = anyView.scatter.clone();

		var vcfg = scatter.settings;

		var retVal = null;
		
		if(vcfg.hasOwnProperty('svcONItemName'))
		{
			retVal = vcfg.svcONItemName;
		}

		return retVal;
	}
	
	static get_svcONItemTimeLeft(anyView)
	{
		const scatter = anyView.scatter.clone();

		var vcfg = scatter.settings;

		var retVal = 'unknown';
		
		if(vcfg.hasOwnProperty('svcONGroup') && vcfg.hasOwnProperty('svcONItemName'))
		{
			var loc_arrStore;
			if(!vcfg.hasOwnProperty('certStore'))
			{
				loc_arrStore = [];
			}
			else
			{
				loc_arrStore = JSON.parse(vcfg.certStore);
			}

			for(let i=0;i<loc_arrStore.length;i++)
			{
				if(loc_arrStore[i].sp==vcfg.svcONGroup)
				{
					retVal = ChroVeMD.getTimeLeft(loc_arrStore[i]);
					break;
				}
			}
			
		}		

		return retVal;
	}
	
	static refresh_svclist(svcView)
	{
		ChroVeMD.log('refresh_svclist');
		
		const scatter = svcView.scatter.clone();

		var vcfg = scatter.settings;
		
		var loc_arrStore;
		if(!vcfg.hasOwnProperty('certStore'))
		{
			loc_arrStore = [];
		}
		else
		{
			loc_arrStore = JSON.parse(vcfg.certStore);
		}

		ChroVeMD.log(JSON.stringify(loc_arrStore));
		loc_arrStore.sort((arg1,arg2)=>{return -(arg1.dt-arg2.dt);});

		svcView.svcLst = loc_arrStore;
		
		if(vcfg.hasOwnProperty('svcONGroup'))
		{
			svcView.svcONGroup = vcfg.svcONGroup;
		}
		
		if(vcfg.hasOwnProperty('svcONItemName'))
		{
			svcView.svcONItemName = vcfg.svcONItemName;
		}

		return;
	}
	
	static store_svcON(svcView,arg1,arg2)
	{
		const scatter = svcView.scatter.clone();

		var vcfg = scatter.settings;

		vcfg.svcONGroup = arg1;
		vcfg.svcONItemName = arg2;

		return scatter;
	}
	
	static filter_idlist(orderThisView, sNetwork)
	{
		ChroVeMD.log('filter_idlist');

		var lstRet = [];
		orderThisView.filteredNetwork = null;

		if(sNetwork == undefined)
		{
			sNetwork = ChroVeMD.sDefEOSChain;
		}

                let network = Network.fromUnique(sNetwork);

                if(!network.host){
                    const hostedNetwork = orderThisView.scatter.settings.networks.find(n => n.chainId === network.chainId && n.host !== '');
                    if(!hostedNetwork)
                    {
                    	ChroVeMD.log("network not found...");
				return lstRet;
                    }
                    network = hostedNetwork;
                }

		for(let idx in orderThisView.identities)
		{
			let curID = orderThisView.identities[idx];
			if(curID.hasAccount(network))
			{
				lstRet.push(curID);
			}
		}

		orderThisView.filteredNetwork = network;
		return lstRet;
	}

	static priceGot(server_contract_address, server_price, double_encoded_in_b58)
	{
		ChroVeMD.log('priceGot');

		//ChroVeMD.savedPayGoView.identities;
		//ChroVeMD.savedPayGoView.proceedInput1();
		ChroVeMD.savedPayGoView.varText1='priceGot';
		//ChroVeMD.savedPayGoView.testOuterCall();
		//ChroVeMD.savedPayGoView.priceText1='priceText1';
		server_price.symbol = 'EOS';
		ChroVeMD.savedPayGoView.priceText1='The price is ' + server_price.amount +' ' + server_price.symbol;
		ChroVeMD.savedPayGoView.priceSymbol=server_price.symbol;
		ChroVeMD.savedPayGoView.priceAmount=server_price.amount;
		ChroVeMD.savedPayGoView.payMemo=double_encoded_in_b58;
	}
	
	static own_svc(anyView)
	{
		try
		{
			var loc_arrStore = JSON.parse(anyView.scatter.settings.certStore);
			for(let i=0;i<loc_arrStore.length;i++)
			{
				if(loc_arrStore[i].lstCert.length>0)
				{
					return true;
				}
			}
		}
		catch(ex1)
		{			
		}
		return false;
	}
	
	static store_cert(certView, bNeedKeepOrig)
	{
		ChroVeMD.log('store_cert');

		if(bNeedKeepOrig == undefined)
		{
			bNeedKeepOrig = false;
		}
		
		const scatter = certView.scatter.clone();

		var vcfg = scatter.settings;
		
		var loc_arrStore;
		if(!vcfg.hasOwnProperty('certStore'))
		{
			loc_arrStore = [];
		}
		else
		{
			loc_arrStore = JSON.parse(vcfg.certStore);
		}

		var nObj = {
			//sp:ChroVeMD.savedMagicCode,
			sp:ChroVeMD.payToEOSAcc+'',
			dt:Date.now(),
			//lstCert:JSON.stringify(ChroVeMD.lstCertJustGot),
			lstCert:ChroVeMD.lstCertJustGot,
			endTime:ChroVeMD.curSvcEndTime,
			origSignal:ChroVeMD.savedMagicCode,
			origURLGoods:ChroVeMD.selectOneFromGoods,
			};
		
		ChroVeMD.log(nObj);

		var bFound=false;
		for(let i=0;i<loc_arrStore.length;i++)
		{
			if(loc_arrStore[i].sp==nObj.sp)
			{
				if(bNeedKeepOrig)
				{
				var keepOrigWhenRefresh=loc_arrStore[i];
				nObj.origSignal=keepOrigWhenRefresh.origSignal;
				nObj.origURLGoods=keepOrigWhenRefresh.origURLGoods;
				}
				
				loc_arrStore[i]=nObj;
				bFound=true;
				break;
			}
		}
		if(!bFound)
		{
			loc_arrStore.push(nObj);
		}
		
		vcfg.certStore = JSON.stringify(loc_arrStore);
		
		ChroVeMD.log(vcfg.certStore);

		return scatter;
	}
	
	static delete_certSP(certView, aSPName)
	{
		const scatter = certView.scatter.clone();

		var vcfg = scatter.settings;
		
		var loc_arrStore;
		if(!vcfg.hasOwnProperty('certStore'))
		{
			loc_arrStore = [];
		}
		else
		{
			loc_arrStore = JSON.parse(vcfg.certStore);
		}

		var sav_arrStore = [];
		
		for(let i=0;i<loc_arrStore.length;i++)
		{
			if(loc_arrStore[i].sp!=aSPName)
			{
				sav_arrStore.push(loc_arrStore[i]);
			}
		}
		
		vcfg.certStore = JSON.stringify(sav_arrStore);

		return scatter;
	}

	static certInfoFetch_CertOK(verifyRet, objArr, origMsg)
	{
		if(!verifyRet.verified)
		{
			return;
		}

		if(origMsg["time2renew"]<1)
		{
			return;
		}

		ChroVeMD.common_certOK(objArr, origMsg);

		ChroVeMD.bIsLoading4Cert = false;
		ChroVeMD.log('ChroVeMD.bIsLoading4Cert = false');
	}

	static common_certOK(objArr, origMsg)
	{
		var nlst = [];
		var jsarr=objArr;
		for(let i=0;i<jsarr.length;i++)
		{
			//nlst.push(JSON.stringify(jsarr[i]));
			nlst.push(jsarr[i]);
		}

		if(nlst.length>0)
		{
			ChroVeMD.lstCertJustGot = nlst;
			ChroVeMD.curSvcEndTime = Date.now();
			//ChroVeMD.curSvcEndTime = Date.now() + origMsg["time2renew"]*3600*1000;
			ChroVeMD.curSvcEndTime = Date.now() + origMsg["time2renew"]*60*1000;
		}
		else
		{
			ChroVeMD.lstCertJustGot = null;
			alert('Invalid response from server...\nPlease try again later.');
		}
	}
	
	static certInfoFetch(certView, infoURL)
	{		
		//alert('Executed - get_info');
		ChroVeMD.log('Executed - priceInfoFetch');

		const locURL = infoURL + 'price.json';

		core_from_ex_github(locURL, false, ()=>{}, ChroVeMD.certInfoFetch_CertOK,ChroVeMD.LoadGKO(certView));

		var loc_func_var=(()=>{if(ChroVeMD.bIsLoading4Cert)ChroVeMD.certInfoFetch(certView, infoURL);});
		setTimeout(loc_func_var,3000);
		
		return;
	}

	static load_cert(certView)
	{
		ChroVeMD.log('load_cert');

try
{
		if(ChroVeMD.lstCertJustGot.length!=0)
		{
			return;
		}
}
catch(loc_ex)
{
}

		ChroVeMD.bIsLoading4Cert = true;
		ChroVeMD.lstCertJustGot = [];

		ChroVeMD.certInfoFetch(certView, ChroVeMD.infoURL);
	}

	static priceInfoFetch_PriceOK(server_contract_address, server_price, double_encoded_in_b58)
	{
		ChroVeMD.log('priceInfoFetch_PriceOK');
		
		//server_price.symbol = 'EOS';
		
		ChroVeMD.priceSymbol=server_price.symbol;
		ChroVeMD.priceSingle=server_price.amount;
		ChroVeMD.payMemo=double_encoded_in_b58;
		ChroVeMD.payToEOSAcc=server_contract_address;

		ChroVeMD.bIsLoading4Price = false;
	}
	
	static priceInfoFetch(priceView, infoURL)
	{		
		//alert('Executed - get_info');
		ChroVeMD.log('Executed - priceInfoFetch');

		const locURL = infoURL + 'price.json';

		core_from_ex_github(locURL, true, ChroVeMD.priceInfoFetch_PriceOK, ()=>{}, ChroVeMD.LoadGKO(priceView));
		
		return;
	}

	static priceInfoFetchTryCert_PriceOK(server_contract_address, server_price, double_encoded_in_b58, origMsg)
	{
		ChroVeMD.log('priceInfoFetchTryCert_PriceOK');

		if(gDbgForceSymbolEOS!=undefined)
		{
			if(gDbgForceSymbolEOS)	server_price.symbol = 'EOS';
		}
		
		ChroVeMD.priceSymbol=server_price.symbol;
		ChroVeMD.priceSingle=server_price.amount;
		ChroVeMD.payMemo=double_encoded_in_b58;
		ChroVeMD.payToEOSAcc=server_contract_address;
		ChroVeMD.origPriceMsg=origMsg;

		//ChroVeMD.bIsLoading4Price = false;
	}

	static priceInfoFetchTryCert_CertOK(verifyRet, objArr, origMsg)
	{
		ChroVeMD.log('priceInfoFetchTryCert_CertOK');
		
		if(!verifyRet.verified)
		{
			return;
		}

		//cert OK process.	
		if(ModCorePriceLogin.gInfoFetchTryCertErrCnt<0)
		{
			return;
		}
		
		ModCorePriceLogin.gInfoFetchTryCertErrCnt=ModCorePriceLogin.gInfoFetchTryCertErrCnt_Idle;

		ChroVeMD.common_certOK(objArr, origMsg);
		
		ChroVeMD.bIsLoading4Price = false;
		ChroVeMD.log('ChroVeMD.bIsLoading4Price = false');
	}
	
	static priceInfoFetchTryCert(priceView, infoURL)
	{		
		//alert('Executed - get_info');
		ChroVeMD.log('Executed - priceInfoFetchTryCert');

		if(ModCorePriceLogin.gInfoFetchTryCertErrCnt>=0)
		{
			setTimeout(()=>{ChroVeMD.priceInfoFetchTryCert(priceView, infoURL);},20);
			return;
		}

		setTimeout(()=>{ChroVeMD.lstCertJustGot = [];ChroVeMD.priceInfoFetchTryCert_Core(priceView, infoURL);},650);
		
		return;
	}
	
	static priceInfoFetchTryCert_Core(priceView, infoURL)
	{		
		//alert('Executed - get_info');
		ChroVeMD.log('Executed - priceInfoFetchTryCert_Core');

		if(ChroVeMD.lstCertJustGot == null)
		{
			return;
		}

		ModCorePriceLogin.gInfoFetchTryCertErrCnt=0;

		const locURL = infoURL + 'price.json';

		var loc_func_var=(()=>{core_from_ex_github(locURL, false, ChroVeMD.priceInfoFetchTryCert_PriceOK, ChroVeMD.priceInfoFetchTryCert_CertOK, ChroVeMD.LoadGKO(priceView), true);});

		setTimeout(loc_func_var,0);
		setTimeout(loc_func_var,500);
		setTimeout(loc_func_var,1000);

		ChroVeMD.savedDate = Date.now();
		setTimeout(ChroVeMD.priceInfoFetchTryCert_ConfirmNoCert,1200);
		
		return;
	}
	
	static priceInfoFetchTryCert_ConfirmNoCert()
	{
		ChroVeMD.log('Executed - priceInfoFetchTryCert_ConfirmNoCert');
		
		if(ModCorePriceLogin.gInfoFetchTryCertErrCnt<=0)
		{
			ModCorePriceLogin.gInfoFetchTryCertErrCnt=ModCorePriceLogin.gInfoFetchTryCertErrCnt_Idle;
			ChroVeMD.bIsLoading4Price = false;
			return;
		}

		var nowDate = new Date();
		if(nowDate-ChroVeMD.savedDate>=30*1000)
		{
			ModCorePriceLogin.gInfoFetchTryCertErrCnt=ModCorePriceLogin.gInfoFetchTryCertErrCnt_Idle;
			ChroVeMD.bIsLoading4Price = false;
			return;
		}

		setTimeout(ChroVeMD.priceInfoFetchTryCert_ConfirmNoCert,20);
	}

	static code_price(priceView, sNetwork, bOnlyGetGoods, matchedURL)
	{
		ChroVeMD.log('code_price');

		if(bOnlyGetGoods==undefined)
		{
			bOnlyGetGoods=false;
		}

		if(matchedURL==undefined)
		{
			matchedURL=null;
		}

		ChroVeMD.bIsLoading4Price = true;
		ChroVeMD.priceSymbol = null;

		if(sNetwork == undefined)
		{
			sNetwork = ChroVeMD.sDefEOSChain;
		}

                let network = Network.fromUnique(sNetwork);

                if(!network.host){
                    const hostedNetwork = priceView.scatter.settings.networks.find(n => n.chainId === network.chainId && n.host !== '');
                    if(!hostedNetwork)
                    {
                    	//ChroVeMD.log("network not found...");
                    	alert("Network not found...\nPlease add network in Chrove!");
			ChroVeMD.bIsLoading4Price = false;
			return;
                    }
                    network = hostedNetwork;
                }
		
		const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});

		var sname = ChroVeMD.savedMagicCode;

		var qpara = {
		json:true,
		code:sname,
		scope:sname,
		table:"srvportal",
		};
		
		eos.getTableRows(qpara.json, qpara.code, qpara.scope, qpara.table, (error, result) => { 
			ChroVeMD.log(error, result);
			
			if(bOnlyGetGoods)
			{
				if(error==null)
				{
					var loc_lst=[];
					var rs=result.rows;
					for(let i=0;i<rs.length;i++)
					{
						loc_lst.push(rs[i].service_info);
					}
					ChroVeMD.lstGoods=loc_lst;
				}
				else
				{
					//error
					ChroVeMD.lstGoods=[];
				}
				return;
			}
			
			try
			{
			var rs=result.rows;
			var idxSel=0;
			for(let i=0;i<rs.length;i++)
			{
				if(rs[i].service_info==matchedURL)
				{
					idxSel=i;
					break;
				}
			}
					
			var service_info = result.rows[idxSel].service_info;
			if(service_info[service_info.length-1] != '/')
			{
				service_info = service_info + '/';
			}
			//payGoView.infoURL = service_info;
			ChroVeMD.infoURL = service_info;
			//alert(service_info);
			ChroVeMD.log(service_info);
			}
			catch(err)
			{
				//payGoView.priceText1='Error while connecting...';
				ChroVeMD.bIsLoading4Price = false;
				return;
			}
			//payGoView.priceText1='Updating price...';
			//ChroVeMD.priceInfoFetch(priceView, service_info);
			ChroVeMD.priceInfoFetchTryCert(priceView, service_info);
			});

		return;
	}
	
	static contract_price(payGoView, sNetwork)
	{
		ChroVeMD.log('contract_price');

		if(sNetwork == undefined)
		{
			sNetwork = ChroVeMD.sDefEOSChain;
		}

                let network = Network.fromUnique(sNetwork);

                if(!network.host){
                    const hostedNetwork = payGoView.scatter.settings.networks.find(n => n.chainId === network.chainId && n.host !== '');
                    if(!hostedNetwork)
                    {
                    	ChroVeMD.log("network not found...");
			return;
                    }
                    network = hostedNetwork;
                }
		
		const eos = Eos({httpEndpoint:network.fullhost(), chainId:network.chainId});

		var sname = payGoView.infoAccount;

		var qpara = {
		json:true,
		code:sname,
		scope:sname,
		table:"srvportal",
		};
		
		eos.getTableRows(qpara.json, qpara.code, qpara.scope, qpara.table, (error, result) => { 
			ChroVeMD.log(error, result);
			try
			{
			var service_info = result.rows[0].service_info;
			if(service_info[service_info.length-1] != '/')
			{
				service_info = service_info + '/';
			}
			payGoView.infoURL = service_info;
			//alert(service_info);
			ChroVeMD.log(service_info);
			}
			catch(err)
			{
				payGoView.priceText1='Error while connecting...';
				return;
			}
			payGoView.priceText1='Updating price...';
			ChroVeMD.get_info3(payGoView, true, service_info);
			});

		return;
	}

	static load_spDict(priceView, aLstGoods, spDict, cbRefresh){
		ChroVeMD.log('load_spDict');
		for(let idx in aLstGoods)
		{
			let curGoods = aLstGoods[idx];
			spDict[curGoods] = 'loading...';

			var service_info = curGoods;
			if(service_info[service_info.length-1] != '/')
			{
				service_info = service_info + '/';
			}

			var infoURL = service_info;
			const locURL = infoURL + 'price.json';
			core_from_ex_github(locURL, true, function(server_contract_address, 
													server_price, 
													double_encoded_in_b58, 
													server_info_response)
				{
					ChroVeMD.log('load_spDict:'+locURL);
					ChroVeMD.log(server_contract_address);
					ChroVeMD.log(curGoods);
					spDict[curGoods] = server_contract_address;
					cbRefresh();
				}, ()=>{}, ChroVeMD.LoadGKO(priceView));
		}
		return;
	}

	//Usage:  format_number(12345.678, 2);
	//result: 12345.68
	static format_number(pnumber,decimals){    
	    if (isNaN(pnumber)) { return 0};    
	    if (pnumber=='') { return 0};    
	          
	    var snum = new String(pnumber);    
	    var sec = snum.split('.');    
	    var whole = parseFloat(sec[0]);    
	    var result = '';    
	          
	    if(sec.length > 1){    
	        var dec = new String(sec[1]);    
	        dec = String(parseFloat(sec[1])/Math.pow(10,(dec.length - decimals)));    
	        dec = String(whole + Math.round(parseFloat(dec))/Math.pow(10,decimals));    
	        var dot = dec.indexOf('.');    
	        if(dot == -1){    
	            dec += '.';    
	            dot = dec.indexOf('.');    
	        }    
	        while(dec.length <= dot + decimals) { dec += '0'; }    
	        result = dec;    
	    } else{    
	        var dot;    
	        var dec = new String(whole);    
	        dec += '.';    
	        dot = dec.indexOf('.');        
	        while(dec.length <= dot + decimals) { dec += '0'; }    
	        result = dec;    
	    }      
	    return result;    
	}

	static checkAccount4TestNet(sAccount){
		ChroVeMD.sDefEOSChain = gChainEOSMainNet;
		try
		{
			if(sAccount.toUpperCase().indexOf('TEST:')==0)
			{
				sAccount=sAccount.slice(5);
				ChroVeMD.sDefEOSChain = gChainEOSTestNet;
			}
		}
		catch(exp)
		{
		}
		return sAccount;
	}

	static getTestNetPrefix(){
		var retVal = '';
		try
		{
			if(ChroVeMD.sDefEOSChain == gChainEOSTestNet)
			{
				retVal = 'test:';
			}
		}
		catch(exp)
		{
		}
		return retVal;
	}

	static calcTimeLeft(aDate, aEndDate)
	{
		var tSpan = aEndDate - aDate;
		ChroVeMD.log(tSpan);
		if(tSpan<=0)	return '';
		//if(tSpan<=0)	return '< 1 minute';
		
		var spanInSec = (tSpan/1000);
		var spanInMin = (spanInSec/60);
		var spanInHour = (spanInMin/60);
		var spanInDay = (spanInHour/24);

		//var rstr = ' left';
		var rstr = '';
		
		if(spanInDay>=2)	return Math.floor(spanInDay)+' days'+rstr;
		if(spanInHour>=2)	return Math.floor(spanInHour)+' hours'+rstr;
		if(spanInMin>=2)	return Math.floor(spanInMin)+' minutes'+rstr;
		if(spanInSec>=60)	return '1 minute'+rstr;
		if(spanInSec<60)	return '< 1 minute'+rstr;
	}

	static testTimeLeft()
	{
		var dlst = [
			//"2017/08/28 01:00:00",
			"2017/08/28 01:00:38",
			"2017/08/28 01:01:10",
			"2017/08/28 01:02:00",
			"2017/08/28 02:05:00",
			"2017/08/28 03:10:00",
			"2017/08/29 03:10:00",
			"2017/08/30 03:10:00",
			"2017/09/30 03:10:00",
			"2017/07/30 03:10:00",
			];
	
		var date1 = new Date("2017/08/28 01:00:00");
		var date2 = new Date(dlst[Math.floor(Math.random()*dlst.length)]);

		return ChroVeMD.calcTimeLeft(date1,date2);
	}

	static getTimeLeft(var1)
	{
		var time1 = Date.now();
		var time2 = var1.endTime;
		if(time2==undefined)	time2=time1;
		return ChroVeMD.calcTimeLeft(time1,time2);
	}

	static removeFloatEndZero(aNumStr)
	{
		try
		{
			var ptPos = aNumStr.lastIndexOf('.');
			if(ptPos>-1)
			{				
				var retVal = aNumStr.substring(ptPos+1);
				while(retVal.endsWith('0'))
				{
					retVal=retVal.slice(0,-1);
				}
				return aNumStr.substring(0,ptPos)+(retVal.length>0?'.':'')+retVal;
			}
		}
		catch(err)
		{
		}
		return aNumStr;
	}
}

ChroVeMD.savedPayGoView = null;
ChroVeMD.savedobjAction = null;

//ChroVeMD.sDefEOSChain = "eos:chain:aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";	//EOS main net
//ChroVeMD.sDefEOSChain = "eos:chain:cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f";	//test node
//ChroVeMD.sDefEOSChain = "eos:chain:038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca";	//EOS jungle
//ChroVeMD.sDefEOSChain = gChainEOSMainNet;	//gChainEOSMainNet is not defined now, lead to global error.

ChroVeMD.gToggle = {bIsOn:false};

ChroVeMD.savedMagicCode = 'deadbeefduck';
ChroVeMD.bIsNewPriceInfo = true;
ChroVeMD.bIsLoading4Price = false;
ChroVeMD.bIsLoading4Cert = false;
ChroVeMD.lstCertJustGot = null;
ChroVeMD.bForceBackFromCertLoading = false;
ChroVeMD.autoFetchWhenReNew = false;
ChroVeMD.bIsRefreshSingleURL = false;
ChroVeMD.lstGoods = null;
ChroVeMD.selectOneFromGoods = null;
ChroVeMD.origPriceMsg = null;

var gDbgEnableConsoleLog=false;
//gDbgEnableConsoleLog=true;

ChroVeMD.log = function(){};
ChroVeMD.error=function(){};
if(gDbgEnableConsoleLog)
{
setTimeout(()=>{alert('Working under console log mode!!!');},2000);
ChroVeMD.log = console.log;
ChroVeMD.error = console.error;
}

ModCorePriceLogin.gInfoFetchTryCertErrCnt = ModCorePriceLogin.gInfoFetchTryCertErrCnt_Idle;

var core_from_ex_github=ModCorePriceLogin.core_from_ex_github;

var gDbgForceSymbolEOS = false;
//gDbgForceSymbolEOS = true;

const gChainEOSMainNet = "eos:chain:aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";	//EOS main net
const gChainEOSTestNet = "eos:chain:038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca";	//EOS jungle

    ChroVeMD.clpJS = new ClipboardJS('.btn_clp');

    ChroVeMD.clpJS.on('success', function(e) {
    ChroVeMD.log('Action:', e.action);
    ChroVeMD.log('Text:', e.text);
    ChroVeMD.log('Trigger:', e.trigger);

    e.clearSelection();
    alert('Memo copied. Now you can paste it to your own wallet.');
	});

    ChroVeMD.clpJS.on('error', function(e) {
    ChroVeMD.log('Action:', e.action);
    ChroVeMD.log('Trigger:', e.trigger);
    
    alert('Operation failed! Please copy the memo by manual.');
	});

ChroVeMD.bSupportClpJS = ClipboardJS.isSupported('copy');


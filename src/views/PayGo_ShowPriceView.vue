<template>
    <section class="backup-showprice scroller">

<section class="panel">

<section v-if="!priceReady">

	<div style="height:100px">
	</div>

	<div class="loading-box"></div>
	
</section>

<section v-else>

	<figure class='ui-paygo-showprice'>

	<div style="height:30px">
	</div>

	<div class='div1'>
	<img :src="brandDetails.logo" style="width:77px;height:77px" :onerror="nofind()" />
	<div style="height:10px">
	</div>
	{{brandDetails.title}}
	</div>

	<div style="height:20px">
	</div>

	<div class='div2'>
	{{brandDetails.desc}}
	</div>

	<div style="height:30px">
	</div>

	<div class='div3'>
	{{'Price: '+priceAmount+' '+priceSymbol+' / '+priceUnit}}
	<br/>
	{{'Quantity: '}}
	<span v-nonSelectable="true">
	<i class="fa" :class="'fa-minus-square'" style="cursor:pointer;font-size:22px;" v-on:click="decrQuantity()"></i>
	<input type="text" v-model="buyQuantity" :key="1" maxlength="4" v-focus="focusState"  v-on:change="checkQuantity"
	style="margin:0px 3px 0px 3px;height:24px;width:48px;border:1px solid #eaeaea;text-align:center;font-family:Avenir-Book;font-size:15px;color:#656565;"></input>
	<i class="fa" :class="'fa-plus-square'" style="cursor:pointer;font-size:22px;" v-on:click="incrQuantity()"></i>
	{{' '+priceUnit+'(s)'}}
<section v-if="false">
</section>	
	</span>
	<br/>
	{{'Total price: '+showTotalPrice+' '+priceSymbol}}
	</div>

	<div style="height:30px">
	</div>

	<div class='div4'>
	<btn v-on:clicked="doPurchase" :text="'Purchase'" :margined="false" style="font-family: PingFangSC-Regular"></btn>
	</div>

	</figure>

</section>

</section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing'
    import AlertMsg from '../models/alerts/AlertMsg'
    import IdentityService from '../services/IdentityService';
    import Mnemonic from '../util/Mnemonic'
    import EOSKeygen from '../util/EOSKeygen'
    import StorageService from '../services/StorageService'
    import AuthenticationService from '../services/AuthenticationService'
    import ChroVeMD from '../models/ChroVeMD'

    export default {
        data(){ return {
            priceText1:'Smart contract not connected...',
            priceSymbol:'',
            priceAmount:'',
            priceUnit:'',
            buyQuantity:ChroVeMD.savedQuantity,
            focusState:true,
            showTotalPrice:'',
            svcLst:[],
            selectedID:null,
            infoAccount:ChroVeMD.savedMagicCode,
            infoURL:'',
            qr_img:'',
            priceReady:false,
            testLst:[],
            rt_names:RouteNames,
            brandDetails:{logo:'',title:'',desc:'No description from this vendor.'},
            imgFallback:'def_glo77.png',
            bIsRefreshSingleURL:ChroVeMD.bIsRefreshSingleURL,
        }},
        computed: {
            ...mapState([
                'scatter'
            ]),
            ...mapGetters([
                'identities',
                'networks',
            ]),
        },
        directives: {
  focus: {
    update: function (el) {
      el.focus()
    	}
  	},
  nonSelectable: {
    inserted: function (el) {
      el.onselectstart=function(){return false;}
    	}
  	},
  },
        mounted(){
            ChroVeMD.lstCertJustGot = [];
            this.checkPriceStatus();
        },
        methods: {
            bind(changed, original) { this[original] = changed },
            verifyCurrentPassword(){
                AuthenticationService.verifyPassword(this.currentPassword, this).then(() => {
                    this.verified = true;
                })
            },
            changePassword(){
                if(AuthenticationService.validPassword(this.newPassword, this.newPasswordConfirmation, this))
                    AuthenticationService.changePassword(this.currentPassword, this.newPassword, this)
            },
            checkPriceStatus(){
            	if(ChroVeMD.bIsNewPriceInfo==false)
            	{
            		this.fillPriceDetails();
            		this.priceReady = true;
            		return;
            	}
            	ChroVeMD.code_price(this,undefined,undefined,ChroVeMD.selectOneFromGoods);
            	this.autoRefreshPrice();
            },
            autoRefreshPrice(){
            	if(ChroVeMD.bIsLoading4Price==true)
            	{
            		setTimeout(this.autoRefreshPrice, 20);
            		return;
            	}

            	ChroVeMD.log('ChroVeMD.bIsLoading4Price==false');
            	ChroVeMD.log(ChroVeMD.lstCertJustGot);
            	ChroVeMD.log(ChroVeMD.priceSymbol);

            	if(ChroVeMD.lstCertJustGot==null)
            	{
			alert('Error while connecting...\nPlease check the entered signal or your network!');
			if(ChroVeMD.bIsRefreshSingleURL)
			{
				this.$router.go(-3);
			}
			else
			{
            			this.$router.back();
            		}
            		return;
            	}

            	if(ChroVeMD.lstCertJustGot.length>0)
            	{
	            	var bExpiredCertGot = false;
	            	if(ChroVeMD.calcTimeLeft(Date.now(), ChroVeMD.curSvcEndTime)=='') bExpiredCertGot=true;
            		if(bExpiredCertGot)
            		{
            		//update scatter store...
            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.store_cert(this, this.bIsRefreshSingleURL)).then(() => {
                });
            		}
            		else
            		{
            		//update scatter store...
            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.store_cert(this, this.bIsRefreshSingleURL)).then(() => {
                     //this.$router.go(-2);
                     this.$router.go(-3);
                });
                	return;
                	}
            	}

            	if(ChroVeMD.priceSymbol==null)
            	{
            		alert('Error while connecting...\nPlease check your network or try again later!');
			if(ChroVeMD.bIsRefreshSingleURL)
			{
				this.$router.go(-3);
			}
			else
			{
            			this.$router.back();
            		}
            		return;
            	}
            	
            	this.fillPriceDetails();
            	ChroVeMD.bIsNewPriceInfo=false;
            	this.priceReady = true;
            },
            fillPriceDetails(){
            	ChroVeMD.log('fillPriceDetails');
            	
            	this.priceSymbol = ChroVeMD.priceSymbol;
            	this.priceAmount = ChroVeMD.priceSingle;
            	this.brandDetails.title = ChroVeMD.payToEOSAcc;
            	this.showTotalPrice=this.calcTotalPrice();

				if(ChroVeMD.origPriceMsg.content.Price.hasOwnProperty('unit'))
				{
					this.priceUnit = ' ' + ChroVeMD.origPriceMsg.content.Price.unit;
				}
            	
            try
            {
            	var brinfo=ChroVeMD.origPriceMsg.content.brandinfo;
            	ChroVeMD.log(ChroVeMD.origPriceMsg);
            	ChroVeMD.log(brinfo);
            	if(brinfo.Logo)	this.brandDetails.logo=brinfo.Logo;
            	//if(brinfo.title)	this.brandDetails.title=brinfo.title;
            	if(brinfo.description)	this.brandDetails.desc=brinfo.description;
            	}
            	catch(err)
            	{
            	}
            },
            nofind(){
            	ChroVeMD.log('nofind');
            	ChroVeMD.log(this.brandDetails.logo);
            	if(this.brandDetails.logo==this.imgFallback)
            	{
            		return;
            	}
            	this.brandDetails.logo=this.imgFallback;
            },
            doPurchase(){
            	ChroVeMD.savedQuantity=this.buyQuantity;
            	ChroVeMD.priceAmount=this.showTotalPrice;
            	this.$router.push({name:RouteNames.PUI_PAYWAY});
            },
            incrQuantity(){
            	this.buyQuantity=Number(this.buyQuantity);
            	if(this.buyQuantity<1)
            	{
            		this.buyQuantity+=0.1;
            	}
            	else
            	{
            		this.buyQuantity+=1;
            	}
            	this.checkQuantity();
            	this.setFocusOnInput();
            },
            decrQuantity(){
            	this.buyQuantity=Number(this.buyQuantity);
            	if(this.buyQuantity>1)
            	{
            		this.buyQuantity-=1;
            	}
            	else if(this.buyQuantity>0.1)
            	{
            		this.buyQuantity-=0.1;
            	}
            	this.checkQuantity();
            	this.setFocusOnInput();
            },
            setFocusOnInput(){
            	this.focusState=true;
            },
            checkQuantity(){
            	this.buyQuantity=Number(this.buyQuantity);
            	this.buyQuantity=this.removeFloatEndZero(this.buyQuantity.toFixed(4));
            	if(this.buyQuantity>9999)
            	{
            		this.buyQuantity=9999;
            	}
            	else if(this.buyQuantity<=0 || isNaN(this.buyQuantity))
            	{
            		this.buyQuantity=1;
            	}
            	this.showTotalPrice=this.calcTotalPrice();
            },
            calcTotalPrice(){
            	return this.removeFloatEndZero((this.priceAmount*this.buyQuantity).toFixed(4));
            },
            removeFloatEndZero(arg1){
            	return ChroVeMD.removeFloatEndZero(arg1);
            },
            ...mapActions([
                Actions.UPDATE_STORED_SCATTER,
                Actions.PUSH_ALERT,
                Actions.SET_SEED,
                Actions.SET_MNEMONIC,
                Actions.IS_UNLOCKED
            ])
        }
    }
</script>

<style lang="scss">
    .checkbox {
        width:56px;
        float:left;
        margin-right:15px;
    }
    .backup-showprice {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            .ui-paygo-showprice{
            	
                color:#656565;
                //font-family:'Raleway',sans-serif;
                //font-weight:300;
                margin-left:10px;

	            .div1{
			//margin: auto;

			left: 146px;
			top: 156px;
			//width: 68px;
			//height: 25px;
			font-size: 18px;
			//text-align: left;
			font-family: PingFangSC-Regular;
			text-align: center;

	            }
	            
	            .div2{
			left: 30px;
			top: 221px;
			//width: 122px;
			//height: 20px;
			font-size: 15px;
			//text-align: left;
			font-family: Avenir-Book;
			text-align: center;

	            }
	            
	            .div3{
			left: 30px;
			top: 262px;
			//width: 111px;
			//height: 21px;
			font-size: 15px;
			text-align: left;
			font-family: Avenir-Book;
			line-height: 24px;

	            }
	            
	            .div4{
			left: 30px;
			top: 313px;
			width: 300px;
			height: 45px;
			border-radius: 2px;
			//background-color: rgba(255, 255, 255, 1);
			text-align: left;

	            }
            
            }

		.loading-box {
		    //width: 100px;
		    height: 50px;
		    background: url(loading_blue.png) no-repeat center, linear-gradient(to top, transparent, transparent);
		    background-size:contain;
		    animation: spin 1.5s linear infinite;
		}
		@keyframes spin{
		    from {
		        transform:rotate(0);
		    }
		    to {
		        transform:rotate(-360deg);
		    }
		}
		
        }
    }
</style>

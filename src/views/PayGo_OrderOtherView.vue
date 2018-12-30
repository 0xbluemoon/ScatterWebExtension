<template>
    <section class="backup-orderother scroller">

<section class="panel">

	<figure class='ui-paygo-orderother'>

<section v-if="true">

	<section v-if="!bMemoConfirmed">

		<div class='div3'>
		Fill following memo in your EOS wallet:
		<div style="height:8px">
		</div>
		<div><font color="red"><span id="copyPayMemo">{{payMemo}}</span></font></div>
		</div>

		<div>
		<div style="height:16px">
		</div>
		<div id="qr2" style="text-align:center;margin-left:-24px;" v-html="this.qr_img2"></div>
		</div>

		<div style="height:30px">
		</div>

		<section v-if="bCopyFuncSupported">

		<div class='div4'>
		<button class="btn_clp" data-clipboard-target="#copyPayMemo" style="font-family: 'Open Sans', sans-serif;">Copy memo</button>
		</div>
		
		<div style="height:20px">
		</div>

		</section>

		<div class='div4'>
		<btn v-on:clicked="changeDisplay" :text="'Memo is filled'" :margined="false" style="font-family: PingFangSC-Regular" :disabled="(!this.bCheckedMyInput)"></btn>
		</div>
		
		<div style="height:16px">
		</div>
		
		<div class='div3'>
		<input type="checkbox" v-on:click="()=>{this.bCheckedMyInput=!(this.bCheckedMyInput);}" v-model="bCheckedMyInput" name="checkbox" style="margin:6px;vertical-align:middle;" />
		I guarantee I fill correct memo
		</div>

	</section>
	
	<section v-else>

		<div class='div1'>
		Pay {{priceAmount+' '+priceSymbol}}
		<br/>
		To {{this.payTo}}
		</div>

		<div>
		<div style="height:10px">
		</div>
		<div id="qr1" style="text-align:center;margin-left:-24px;" v-html="this.qr_img1"></div>
		</div>

		<div style="height:30px">
		</div>

		<div class='div4'>
		<btn v-on:clicked="changeDisplay" :text="'Show memo again'" :margined="false" style="font-family: PingFangSC-Regular"></btn>
		</div>
		
		<div style="height:20px">
		</div>

		<div class='div4'>
		<btn v-on:clicked="doPaid" :text="'Already paid'" :margined="false" style="font-family: PingFangSC-Regular"></btn>
		</div>
	
	</section>

</section>

	</figure>

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
            priceSymbol:ChroVeMD.priceSymbol,
            priceAmount:ChroVeMD.priceAmount,
            payMemo:ChroVeMD.payMemo,
            svcLst:[],
            selectedID:null,
            infoAccount:ChroVeMD.savedMagicCode,
            payTo:ChroVeMD.payToEOSAcc,
            infoURL:'',
            qr_img1:'',
            qr_img2:'',
            cidReady:false,
            testLst:[],
            bMemoConfirmed:false,
            rt_names:RouteNames,
            bCheckedMyInput:false,
            bCopyFuncSupported:ChroVeMD.bSupportClpJS,
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
        mounted(){
            this.genQRCode();
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
            genQRCode()
            {
            	var imgstr1 = create_qrcode(this.payTo, "0", "M", "Byte", "UTF-8");
            	var imgstr2 = create_qrcode(this.payMemo, "0", "M", "Byte", "UTF-8");
            	imgstr1 = imgstr1.replace('"/>','" style="width:120px;height:120px"/>');
            	imgstr2 = imgstr2.replace('"/>','" style="width:120px;height:120px"/>');
            	this.qr_img1 = imgstr1;
            	this.qr_img2 = imgstr2;
            	
            },
            doPaid(){
            ChroVeMD.bForceBackFromCertLoading = false;
            	this.$router.push({name:RouteNames.PUI_PAIDLOADING});
            },
            changeDisplay(){
            	this.bCheckedMyInput=false;
            	this.bMemoConfirmed=!(this.bMemoConfirmed);
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
    .backup-orderother {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            .ui-paygo-orderother{
            	
                color:#656565;
                //font-family:'Raleway',sans-serif;
                //font-weight:300;
                margin-left:10px;

	            .div1{
			left: 28px;
			top: 58px;
			//width: 90px;
			height: 42px;
			font-size: 15px;
			text-align: left;
			font-family: PingFangSC-Regular;

	            }
	            
	            .div2{
			left: 28px;
			top: 104px;
			//width: 67px;
			height: 20px;
			font-size: 15px;
			text-align: left;
			font-family: Avenir-Book;

	            }
	            
	            .div3{
			left: 28px;
			top: 151px;
			//width: 100px;
			//height: 42px;
			font-size: 15px;
			text-align: left;
			font-family: PingFangSC-Regular;

	            }
	            
	            .div4{
			left: 30px;
			top: 262px;
			//width: 300px;
			height: 50px;
			border-radius: 2px;
			//background-color: rgba(243, 243, 243, 1);
			text-align: left;

	            }
            
            }
        }
    }
</style>

<template>
    <section class="backup scroller">

<section class="panel">

<figure class='ui-paygo-entercode'>

<div style="height:40px">
</div>

<div class='div1'>
Which market to go
</div>

<div style="height:100px">
</div>

<div class='div2'>
Market name:
</div>

<div style="height:10px">
</div>

<div class='div3'>
<cin :placeholder="'...'" v-on:changed="changed => bind(changed, 'infoAccount')" :key="1" :id="'Input1'" :text="this.infoAccount"></cin>
</div>

<div style="height:20px">
</div>

<div class='div4'>
<btn v-on:clicked="doFetch" :text="'Go'" :margined="false" style="font-family: PingFangSC-Regular"></btn>
</div>

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
            priceSymbol:'',
            priceAmount:'',
            selectedID:null,
//            infoAccount:'abcde12345de',
            infoAccount:ChroVeMD.getTestNetPrefix()+ChroVeMD.savedMagicCode,
            infoURL:'',
            qr_img:'',
            cidReady:false,
            testLst:[],
            rt_names:RouteNames,
            svcLst:[],
            svcONGroup:'',
            svcONItemName:'',
            gToggle:false,
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
            if(ChroVeMD.autoFetchWhenReNew)
            {
            	ChroVeMD.autoFetchWhenReNew=false;
            	//this.doFetch();
            }
            if(ChroVeMD.bIsRefreshSingleURL)
            {
            	ChroVeMD.savedMagicCode = ChroVeMD.checkAccount4TestNet(this.infoAccount);
		
				if(ChroVeMD.check_expired(this))
				{
	            		//update scatter store...
	            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.store_svcON(this,"",null)).then(() => {
	            			ChroVeMD.check_proxy(this);
	            			this.$router.push({name:RouteNames.PUI_USETHIS});
	                });
	                return;
				}

				this.$router.push({name:RouteNames.PUI_USETHIS});		
            }
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
            doFetch(){
		ChroVeMD.savedMagicCode = ChroVeMD.checkAccount4TestNet(this.infoAccount);
		//ChroVeMD.bIsNewPriceInfo = true;
		ChroVeMD.lstGoods = null;
		
		if(ChroVeMD.check_expired(this))
		{
            		//update scatter store...
            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.store_svcON(this,"",null)).then(() => {
            			ChroVeMD.check_proxy(this);
            			this.$router.push({name:RouteNames.PUI_USETHIS});
                });
                return;
		}
		
            	this.$router.push({name:RouteNames.PUI_USETHIS});
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
    .backup {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            .ui-paygo-entercode{
            	
                color:#656565;
                //font-family:'Raleway',sans-serif;
                //font-weight:300;
                margin-left:10px;

	            .div1{
			margin: auto;

			top: 57px;
			//width: 175px;
			height: 25px;
			font-size: 18px;
			text-align: center;
			font-family: PingFangSC-Semibold;
	            }
	            
	            .div2{
			left: 30px;
			top: 199px;
//			width: 70px;
			height: 17px;
			font-size: 12px;
			font-family: PingFangSC-Regular;

	            }
	            
	            .div3{
			left: 30px;
			top: 222px;
			width: 300px;
//			height: 45px;
			border-radius: 2px;
			background-color: rgba(243, 243, 243, 1);
			text-align: left;

	            }
	            
	            .div4{
			left: 30px;
			top: 314px;
			width: 300px;
//			height: 45px;
			border-radius: 2px;
//			background-color: rgba(255, 255, 255, 1);
			text-align: left;

	            }
            
            }
        }
    }
</style>

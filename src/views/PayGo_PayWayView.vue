<template>
    <section class="backup scroller">

<section class="panel">

<section v-if="false">
<figure class='ui-paygo-showprice'>

<div style="height:70px">
</div>

<div class='div1'>
<i class="fa" :class="'fa-shopping-cart'" style="font-size:72px;"></i>
</div>

<div style="height:120px">
</div>

<div style="height:20px">
</div>

<div class='div4'>
<btn v-on:clicked="doPayThis" :text="'Pay with Chrove'" :margined="false" style="font-family: PingFangSC-Regular"></btn>
<div style="height:20px"></div>
<btn v-on:clicked="doPayOther" :text="'Pay with other wallet'" :margined="false" style="font-family: PingFangSC-Regular"></btn>
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
            svcLst:[],
            selectedID:null,
            infoAccount:'babb3',
            infoURL:'',
            qr_img:'',
            cidReady:false,
            testLst:[],
            rt_names:RouteNames,
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
            this.doPayOther();
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
            doPayThis(){
            	this.$router.push({name:RouteNames.PUI_ORDERTHIS});
            },
            doPayOther(){
            	this.$router.push({name:RouteNames.PUI_ORDEROTHER});
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
			height: 25px;
			font-size: 18px;
			//text-align: left;
			font-family: PingFangSC-Regular;
			text-align: center;

	            }
	            
	            .div2{
			left: 30px;
			top: 221px;
			//width: 122px;
			height: 20px;
			font-size: 15px;
			text-align: left;
			font-family: Avenir-Book;

	            }
	            
	            .div3{
			left: 30px;
			top: 262px;
			//width: 111px;
			height: 21px;
			font-size: 15px;
			text-align: left;
			font-family: Avenir-Book;

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
        }
    }
</style>
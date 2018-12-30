<template>
    <section class="backup-orderthis scroller">

<section class="panel">

<figure class='ui-paygo-orderthis'>

<div style="height:10px">
</div>

		<div class='div1'>
		Pay {{priceAmount+' '+priceSymbol}}
		<br/>
		To {{this.payTo}}
		</div>

<div style="height:30px">
</div>

<div class='div3'>
Payment memo:
<div>{{payMemo}}</div>
</div>

<div style="height:50px">
</div>

<div class='div4'>
<section v-if="filteredIDList.length>1">
<sel :options="filteredIDList" :parser="item => item.name" v-on:changed="selectIDItem"></sel>
<div style="height:20px"></div>
</section>
<section v-else>
<div style="height:30px"></div>
</section>
<input placeholder="Enter password" type="password" v-model="currentPassword" :key="1" style="margin-top:0px;font-family: PingFangSC-Regular;height:50px;width:100%;padding: 0 15px;font-size:18px;border: 1px solid #eaeaea;"></input>
<div style="height:20px"></div>
<btn v-on:clicked="doPay" :text="'Pay now'" :margined="false" :disabled="bPayBtnBusy" style="font-family: PingFangSC-Regular"></btn>
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
            priceSymbol:ChroVeMD.priceSymbol,
            priceAmount:ChroVeMD.priceAmount,
            payMemo:ChroVeMD.payMemo,
            svcLst:[],
            selectedID:null,
            infoAccount:ChroVeMD.savedMagicCode,
            payTo:ChroVeMD.payToEOSAcc,
            infoURL:'',
            qr_img:'',
            cidReady:false,
            testLst:[],
            filteredIDList:[],
            bPayBtnBusy:false,
            filteredNetwork:null,
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
            this.filteredIDList = this.filterIDList();
            if(this.filteredIDList.length>0)
            {
            	this.selectedID=this.filteredIDList[0];
            }
        },
        methods: {
            bind(changed, original) { 
            ChroVeMD.log('bind');
            this[original] = changed;
            },
            verifyCurrentPassword(){
                AuthenticationService.verifyPassword(this.currentPassword, this).then(() => {
                    this.verified = true;
                })
            },
            changePassword(){
                if(AuthenticationService.validPassword(this.newPassword, this.newPasswordConfirmation, this))
                    AuthenticationService.changePassword(this.currentPassword, this.newPassword, this)
            },
            filterIDList()
            {
            	return ChroVeMD.filter_idlist(this);
            },
            selectIDItem(targetItem){
            ChroVeMD.log('selectIDItem');
            this.selectedID=targetItem;
            },
            doPay(){
            ChroVeMD.log('doPay');
            if(this.filteredIDList.length==1)
            {
            	this.selectedID = this.filteredIDList[0];
            }
            if(this.selectedID==null)
            {
            	alert('No valid ID!');
            	return;
            }
            	this.bPayBtnBusy=true;
            	AuthenticationService.verifyPassword(this.currentPassword, this).then(() => {
                    //this.verified = true;
                    ChroVeMD.pay_orderthis(this);
                    this.$router.push({name:RouteNames.PUI_PAIDLOADING});
                });
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
    .backup-orderthis {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            .ui-paygo-orderthis{
            	
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
			height: 45px;
			border-radius: 2px;
			//background-color: rgba(243, 243, 243, 1);
			text-align: left;

	            }
            
            }
        }
    }
</style>

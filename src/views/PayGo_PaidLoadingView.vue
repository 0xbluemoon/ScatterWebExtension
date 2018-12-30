<template>
    <section class="backup-loading scroller">

<section class="panel">

<div style="height:100px">
</div>

<div class="loading-box"></div>

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
            ChroVeMD.lstCertJustGot = [];
            this.getCert();
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
            getCert(){
            	ChroVeMD.load_cert(this);
            	this.autoRefreshCert();
            },
            autoRefreshCert(){
            	//ChroVeMD.log('autoRefreshCert');
            	if(ChroVeMD.bForceBackFromCertLoading==true)
            	{
            		this.$router.back();
            		return;
            	}
            	
            	if(ChroVeMD.bIsLoading4Cert==true)
            	{
            		setTimeout(this.autoRefreshCert, 20);
            		return;
            	}

		//ChroVeMD.log('ChroVeMD.bIsLoading4Cert==false');
            	if(ChroVeMD.lstCertJustGot.length==0)
            	{
	            	this.getCert();
            	}
            	else
            	{
            		//update scatter store...
            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.store_cert(this)).then(() => {
                    this.svcGot();
                });
            	}
            },
            svcGot()
            {
            	ChroVeMD.log('svcGot');
            	//gDbgLocalSvcInited = true;
            	//this.$router.go(-6);
            	this.$router.go(-6);
            },
            initAutoFinish()
            {
            	setTimeout(this.svcGot, 3000);
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
    .backup-loading {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
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
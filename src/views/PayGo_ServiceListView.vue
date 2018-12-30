<template>
    <section class="backup-servicelist scroller">

<section v-if="!cidReady">

	<section class="panel-sl">

	<div style="height:100px">
	</div>

	<div class="loading-box"></div>

	</section>
	
</section>

<section v-else>

	<section v-if="bReLoadList">
	</section>
	<section v-else>

	<div style="height:420px;overflow-y:auto;">

<section v-if="true">

        <section class="p20 scroller with-search" v-if="svcLst.length" style="height:fit-content;">
            <section v-for="var1 in this.svcLst" class="panel-box">
            	<section v-for="var2 in var1.lstCert" class="panel">

					<figure class="icontype"><i class="fa" :class="checkWhetherON(var1,var2)?'fa-check-square-o':'fa-square-o'"
					v-on:click="selectSvc(var1.sp,var2.server_name)" :style="'cursor:'+(checkWhetherON(var1,var2)?'auto':'pointer')"></i></figure>
					<span :title="var2.server_name" style="font-family:'Raleway',sans-serif;">{{cutLongText(var2.server_name,16)}}</span>
					<figure class="icontype" :title="var2.type"><i class="fa" :class="selectTypeIconProd(var2.type)"></i></figure>
            	
            	</section>

<section v-if="!getTimeLeft(var1)"  class="panel">
	         <button type="button" class="btnrenew" 
	         style="display:inline-block;vertical-align:bottom;" v-on:click="deleteSP(var1.sp)">Delete</button>
	         <button type="button" class="btnrenew" 
	         style="display:inline-block;vertical-align:bottom;" v-on:click="reNewWork(var1)">Refresh</button>
	         <div/>
	         <span class="thin-font">{{var1.sp}}</span>
	         <span class="thin-font" title="Not up to date? Please refresh it later.">&nbsp;(expired)&nbsp;</span>
</section>
<section v-else  class="panel">
	         <button type="button" class="btnrenew" 
	         style="display:inline-block;vertical-align:bottom;" v-on:click="deleteSP(var1.sp)">Delete</button>
	         <button type="button" class="btnrenew" 
	         style="display:inline-block;vertical-align:bottom;" v-on:click="reNewWork(var1)">Refresh</button>
	         <div/>
	         <span class="thin-font">{{var1.sp}}</span>
	         <span class="thin-font" title="Not up to date? Please refresh it later.">&nbsp;({{getTimeLeft(var1)}} left)&nbsp;</span>
</section>
            </section>
        </section>
        
</section>

	</div>

	</section>

	<section class="panel-sl">
	<figure class="headersl"></figure>
	<figure class="sub-headersl">
	 <router-link :to="{name:rt_names.PUI_ENTERCODE}"><figure class="iconsl"><i class="fa" :class="'fa-plus-square'"></i></figure>Order more...</router-link>
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
            svcONGroup:'',
            svcONItemName:'',
            gToggle:false,
            rt_names:RouteNames,
            bReLoadList:false,
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
        	ChroVeMD.bIsRefreshSingleURL = false;
        	this.genSvcList();
        	this.checkClientID();
        	this.autoGoNextWhenEmpty();
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
            genSvcList(){
            	ChroVeMD.log('genSvcList');
            	ChroVeMD.refresh_svclist(this);
            	ChroVeMD.log(this.svcLst);
            },
            checkClientID(){
            ChroVeMD.log('checkClientID');
            this.cidReady = ChroVeMD.check_ID(this);
            if(this.cidReady)	return;
            ChroVeMD.init_ID(this, Actions.UPDATE_STORED_SCATTER);
            },
            autoGoNextWhenEmpty()
            {
            	if(this.cidReady==false)
            	{
            		setTimeout(this.autoGoNextWhenEmpty, 20);
            		return;
            	}
            
        	//if(!gDbgLocalSvcInited)
        	if(!ChroVeMD.own_svc(this))
        	{
        		this.$router.push({name:RouteNames.PUI_ENTERCODE});
        	}
            },
            selectTypeIconProd(item_str){
            	switch(item_str.toUpperCase())
            	{
            	case 'SS':
            		return 'fa-send';
            	case 'HTTPS':
            		//return 'fa-user-secret';
            		return 'fa-shield';
            	default:
            		return 'fa-user';
            	}
            },
            selectTypeIcon(item_str){
            	switch(item_str)
            	{
            	case 'aaa':
            		return 'fa-send';
            	case 'bbbg':
            		return 'fa-user-secret';
            	default:
            		return 'fa-user';
            	}
            },
            cutLongText(aStr, aLen){
            	if(aStr.length<=aLen)	return aStr;
            	return aStr.slice(0,aLen)+'...';
            },
            selectSvc(arg1,arg2)
            {
            	ChroVeMD.log(arg1);
            	ChroVeMD.log(arg2);
            	
            		//update scatter store...
            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.store_svcON(this,arg1,arg2)).then(() => {
		            	this.svcONGroup=arg1;
		            	this.svcONItemName=arg2;
		            	this.gToggle=false;
		            	ChroVeMD.set_proxy(this);
                });
                
            },
            checkWhetherON(var1,var2)
            {
            	return (var1.sp==this.svcONGroup && var2.server_name==this.svcONItemName);
            },
            testTimeLeft()
            {
            	return ChroVeMD.testTimeLeft();
            },
            getTimeLeft(var1)
            {
            	return ChroVeMD.getTimeLeft(var1);
            },
            reNewWork(var1)
            {
            		ChroVeMD.log('reNewWork');
            		ChroVeMD.log(var1);
            		
            		if(var1.hasOwnProperty('origSignal') && var1.hasOwnProperty('origURLGoods'))
            		{
            			ChroVeMD.savedMagicCode = var1.origSignal;
            			ChroVeMD.selectOneFromGoods = var1.origURLGoods;
            		}
            		else
            		{
            			ChroVeMD.savedMagicCode = var1.sp;
            		}
            
            		ChroVeMD.autoFetchWhenReNew = true;
            		ChroVeMD.bIsRefreshSingleURL = true;
        		this.$router.push({name:RouteNames.PUI_ENTERCODE});
            },
            deleteSP(aSPName)
            {
            	if(confirm('Confirm to remove <'+aSPName+'> from the display list?'))
            		//if(this.svcONGroup==aSPName)	this.selectSvc('','');
            
            		//update scatter store...
            		this[Actions.UPDATE_STORED_SCATTER](ChroVeMD.delete_certSP(this, aSPName)).then(() => {
                     //this.$router.go(0);
        		this.autoGoNextWhenEmpty();
        		this.genSvcList();
                     this.bReLoadList=true;
                     this.bReLoadList=false;
                     //setTimeout(()=>{this.bReLoadList=false;}, 0);                     
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
    .backup-servicelist {
        //font-family:'Open Sans', sans-serif;
        //font-family:'Raleway',sans-serif;
        //font-weight:300;
        color:#656565;

      .groupboxsl {
      font-family:'Raleway';
      border-color:#E2DED6;
      border-width:1px;
      border-style:Solid;
      margin:20px;
      margin-top:0px;
      margin-bottom:0px;
      font-size:18px;
                
    .btnrenew {
    	//vertical-align:top;
    	font-size:12px;
    	width:72px;
    	height:20px;
    	//margin-left:4px;
    	margin-left:0px;
    	margin-right:6px;
    	background-color: #cfcfcf;
       font-family:'Avenir-Book';

        &.tond{
	//font-size:18px;
            background-color: #ffffff;
        }
    
    }

        .itemsl {

       font-family:'Avenir-Book';
	font-size:18px;
	//margin:5px;
	padding:2px;
	//color:#656565;

            &:not(.last){
		//font-size:18px;
                border-bottom:1px solid #e3e3e3;
            }

    	        .icontype {
            //padding:16px 0;
            display:inline-block;
            font-size:18px;
            color:#656565;
            width:16px;
            text-align:center;
            //margin-right:10px;
            vertical-align: top;
    		}

            .right-group {
                //cursor: pointer;
                //padding:16px 0;
                display:inline-block;
                font-size:16px;
                color:#656565;
                //width:30px;
                //margin-right:10px;
                float:right;
                //margin-top:-2px;
                
	        .iconsl {
	                //padding:16px 0;
	                display:inline-block;
	                font-size:18px;
	                color:#656565;
	                width:16px;
	                text-align:center;
	                //margin-right:10px;
	                vertical-align: top;
	        }
                
	        .btnsl {
	        	//vertical-align:top;
	        	font-size:11px;
	        	width:72px;
	        	height:20px;
	        	margin-left:8px;
	        	background-color: #cfcfcf;

	            &.tond{
			//font-size:18px;
	                background-color: #ffffff;
	            }
            
	        }
            }
        }
      }

        .panel-sl {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            .headersl {
                color:#cecece;
                font-size:11px;
                padding-bottom:5px;
                //margin-top:-5px;
                //margin-bottom:10px;
                border-bottom:1px solid #eaeaea;
            }

            .sub-headersl {
                display:inline-block;
                font-size:20px;
                color:#656565;
                font-family:'Raleway',sans-serif;
                font-weight:300;
                
		        .iconsl {
		                padding:16px 0;
		                display:inline-block;
		                font-size:24px;
		                color:#656565;
		                //width:32px;
		                text-align:center;
		                margin-right:10px;
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

        .panel {
        
            font-size:14px;
            padding:6px;

    	    .icontype {
            //padding:16px 0;
            display:inline-block;
            font-size:18px;
            color:#656565;
            width:16px;
            text-align:center;
            //margin-right:10px;
            vertical-align: top;
    		}

	    .btnrenew {
	    	//vertical-align:top;
	    	font-size:12px;
	    	width:72px;
	    	height:20px;
	    	//margin-left:4px;
	    	margin-left:0px;
	    	margin-right:6px;
	    	background-color: #cfcfcf;
	       font-family:'Avenir-Book';

	        &.tond{
		//font-size:18px;
	            background-color: #ffffff;
	        }
		  }

	    .thin-font {
	    	font-size:12px;
	    	display:inline-block;
		  }
      }

        
    }
</style>

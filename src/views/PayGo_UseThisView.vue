<template>
    <section class="backup-goods scroller">

<section v-if="!goodsReady">

	<div style="height:100px">
	</div>

	<div class="loading-box"></div>
	
</section>

<section v-else>

        <section class="p20 scroller with-search" v-if="goodsLst.length">
            <section v-for="var1 in goodsLst" class="panel-box">

                <section class="panel" style="cursor:pointer" v-on:click="viewGoodsInfo(var1)">

	<section v-if="bReLoadList">
	</section>
	<section v-else>
	
                <span>{{spDict[var1]}}</span>

	</section>
	
                </section>

            		<section v-if="false">

                <!-- Header -->
                <section class="panel">
                    <figure class="header big"><i class="fa fa-globe"></i>{{keypair.name}}</figure>
                    <figure class="header small margin"><i class="fa fa-globe"></i>{{keypair.publicKey.substr(0,12)}}...</figure>
                    <figure class="header small margin"><i class="fa fa-plug"></i>{{keypair.blockchain.toUpperCase()}}</figure>
                </section>

                <!-- Actions -->
                <section class="panel">
                    <section class="actions">
                        <figure class="action blue" v-on:click="copyKeypair(keypair)"><i class="fa fa-copy"></i></figure>
                        <figure class="action red right" v-on:click="deleteKeypair(keypair)"><i class="fa fa-ban"></i></figure>
                    </section>
                </section>
                
            		</section>

            </section>
        </section>

        <section class="nothing-here" v-else>
            <figure class="header">{{locale(langKeys.KEYPAIRS_NoKeyPairsHeader)}}</figure>
            <figure class="sub-header">{{locale(langKeys.KEYPAIRS_NoKeyPairsDescription)}}</figure>
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
//            testLst:['item1', 'item2'],
            testLst:[],
            rt_names:RouteNames,
            goodsReady:false,
            goodsLst:[],
            spDict:[],
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
            if(ChroVeMD.bIsRefreshSingleURL)
            {
            	this.viewGoodsInfo(ChroVeMD.selectOneFromGoods);
            	return;
            }
            ChroVeMD.selectOneFromGoods=null;
            this.goodsFromCode();
        },
        methods: {
            bind(changed, original) { this[original] = changed },
            goodsFromCode(){
            	ChroVeMD.log('goodsFromCode');
            	//setTimeout(()=>(this.goodsReady=true), 2000);
            	ChroVeMD.code_price(this,undefined,true);
            	this.autoRefreshGoods();
            },
            autoRefreshGoods(){
            	if(ChroVeMD.lstGoods==null)
            	{
            		setTimeout(this.autoRefreshGoods, 20);
            		return;
            	}
            	if(ChroVeMD.lstGoods.length<1)
            	{
			alert('Error while connecting...\nPlease check the entered signal or your network!');
            		this.$router.back();
            		return;
            	}
            	this.goodsLst=ChroVeMD.lstGoods;
            	//setTimeout(()=>{this.spDict['http://kim.blockchaincomputer.one:8898']='aaa';this.bReLoadList=true;this.bReLoadList=false;}, 2000);
            	this.spDict=[];
            	ChroVeMD.load_spDict(this,this.goodsLst,this.spDict,()=>{this.bReLoadList=true;this.bReLoadList=false;ChroVeMD.log(this.spDict);});
            	this.goodsReady=true;
            	ChroVeMD.log(this.goodsLst);
            },
            viewGoodsInfo(targetURL){
            	ChroVeMD.log('viewGoodsInfo');
            	ChroVeMD.selectOneFromGoods=targetURL;
            	ChroVeMD.bIsNewPriceInfo = true;
				ChroVeMD.savedQuantity = 1;
            	this.$router.push({name:RouteNames.PUI_SHOWPRICE});
            },
            selectIDItem(targetItem){
            ChroVeMD.log('selectIDItem');
            this.selectedID=targetItem;
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
    .backup-goods {
        font-family:'Open Sans', sans-serif;

        .panel {
            padding:20px;

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            font-family: 'Raleway',sans-serif;
            font-size: 16px;
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
</style>
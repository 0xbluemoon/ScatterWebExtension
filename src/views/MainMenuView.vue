<template>
    <section class="main-menu">
        <section class="item" v-for="link in links">
            <router-link :to="{name:link.route}" v-if="link.name != locale(langKeys.MAINMENU_Lock)">
                <figure class="icon"><i class="fa" :class="'fa-'+link.icon"></i></figure>
                <figure class="text">{{link.name}}</figure>
            </router-link>
            
            <section v-else v-on:click="lockScatter">
                <figure class="icon last"><i class="fa" :class="'fa-'+link.icon"></i></figure>
                <figure class="text">{{link.name}}</figure>
            </section>
        </section>

<section class="paygo-part">
	<section class="panel-m">
	<figure class="header">PayGo Service<figure class="header-icon">
	<img style="cursor: pointer;" :src="'/assets/' + (gToggle?'on':'off') + '.png'" v-on:click="changeToggle" :height="56*icon_switch_size_ratio" :width="142*icon_switch_size_ratio"/>
	</figure></figure>
<section v-if="gToggle">
	<figure class="sub-header" :title="displaySvcName">{{cutLongText(displaySvcName,16)}} {{(curItemTimeLeft==''?'':'('+curItemTimeLeft+' left)')}}
	<font color="red">{{(curItemTimeLeft==''?'(expired)':'')}}</font></figure>
</section>
<section v-else>
	<figure class="sub-header">&nbsp;</figure>
</section>

<section v-if="ownSvc()">
	<btn v-on:clicked="changeSvc" :text="'Change service'" :margined="true"></btn>
</section>
<section v-else>
	<btn v-on:clicked="changeSvc" :text="'Order your first service'" :margined="true"></btn>
</section>

	</section>
</section>

    </section>
</template>

<script>
    import { mapActions, mapGetters, mapState } from 'vuex'
    import * as Actions from '../store/constants';
    import {RouteNames} from '../vue/Routing'
    import * as LANG_KEYS from '../localization/keys';


    import Network from '../models/Network'
    import Identity from '../models/Identity'
    import Permission from '../models/Permission'
    import ChroVeMD from '../models/ChroVeMD'

    export default {
        data(){ return {
            links:[
//                {route:RouteNames.IDENTITIES, name:this.locale(LANG_KEYS.MAINMENU_Identities), icon:'address-book'},
//                {route:RouteNames.KEYS, name:this.locale(LANG_KEYS.MAINMENU_Keys), icon:'key'},
//                {route:RouteNames.PERMISSIONS, name:this.locale(LANG_KEYS.MAINMENU_Permissions), icon:'shield'},
//                {route:RouteNames.HISTORY, name:this.locale(LANG_KEYS.MAINMENU_History), icon:'history'},
                {name:this.locale(LANG_KEYS.MAINMENU_Lock), icon:'lock'},
//                {route:'entry', name:this.locale(LANG_KEYS.MAINMENU_Identities), icon:'address-book'},
//                {route:RouteNames.PAYGO, name:'PayGoService', icon:'globe'},
            ],
            icon_switch_size_ratio:0.4,
            //gToggle:ChroVeMD.gToggle,
            gToggle:false,
            displaySvcName:'',
            curItemTimeLeft:'',
        }},
        computed: {
            ...mapState([
                'scatter'
            ])
        },
        mounted(){
        	this.initToggle();
        	this.displaySvcName=ChroVeMD.get_svcONItemName(this);
        },
        methods: {
            bind(changed, original) { this[original] = changed },
            lockScatter(){
                this[Actions.LOCK]().then(() => {
                    this.$router.push({name:RouteNames.ENTRY});
                })
            },
            changeSvc()
            {
			this.$router.push({name:RouteNames.PUI_SERVICELIST});
            },
            ownSvc()
            {
            		return (ChroVeMD.own_svc(this));
            },
            initToggle()
            {
            	ChroVeMD.check_proxy(this);
            	this.getCurItemTimeLeft();
            },
            changeToggle()
            {
            	//this.gToggle.bIsOn = !this.gToggle.bIsOn;
            	ChroVeMD.set_proxy(this);
            	this.getCurItemTimeLeft();
            },
            cutLongText(aStr, aLen){
            	if(aStr.length<=aLen)	return aStr;
            	return aStr.slice(0,aLen)+'...';
            },
            getCurItemTimeLeft(){
            	this.curItemTimeLeft = ChroVeMD.get_svcONItemTimeLeft(this);
            },
            ...mapActions([
                Actions.LOCK,
                Actions.UPDATE_STORED_SCATTER
            ])
        }
    }
</script>

<style lang="scss">

    .main-menu {
        padding:40px 0;

        .item {
            cursor: pointer;
            padding:0 40px;
            transition:background 0.2s ease;

            &:hover {
                background:#f8f8f8;
            }

            .icon {
                padding:16px 0;
                display:inline-block;
                font-size:18px;
                color:#656565;
                width:30px;
                text-align:center;
                margin-right:10px;

                &:not(.last){
                    border-bottom:1px solid #e3e3e3;
                }
            }

            .text {
                padding:16px 0;
                display:inline-block;
                font-size:24px;
                color:#656565;
                font-family:'Raleway',sans-serif;
                font-weight:300;
            }
        }
    }
    
    .paygo-part {
        font-family:'Open Sans', sans-serif;

        .panel-m {
            padding:40px;
            transition:background 0.2s ease;

            &:hover {
                background:#f8f8f8;
            }

            &:not(:last-child){
                border-bottom:1px solid #eaeaea;
            }

            .header {
                //color:#cecece;
                color:#aeaeae;
                font-size:16px;
                //padding-bottom:5px;
                margin-top:-5px;
                margin-bottom:5px;
                //border-bottom:1px solid #eaeaea;

	            .header-icon {
	                //cursor: pointer;
	                //padding:16px 0;
	                display:inline-block;
	                font-size:18px;
	                color:#656565;
	                //width:30px;
	                //margin-right:10px;
	                float:right;
	            }
                
            }

            .sub-header {
                //color:#aeaeae;
                color:#cecece;
                font-size:12px;
                //margin-bottom:5px;
            }
        }
    }

</style>

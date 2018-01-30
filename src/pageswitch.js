(function($){
	
	/*插件主体*/
	$.fn.PageSwitch=function(options){
		/*构造函数*/
		var PageSwitch=(function(){
			function PageSwitch(element,options){
				this.settings=$.extend(true,$.fn.PageSwitch.defaults,options||{});
				this.element=element;
			    this.init();/*初始化插件*/
			}
			/*方法放入原型*/
			PageSwitch.prototype={
				init:function(){
					var me=this;
					me.selectors=me.settings.selectors;
					me.sections=me.element.find(me.selectors.sections);
					me.section=me.sections.find(me.selectors.section);
					me.direction=me.settings.direction=='vertical'?true:false;
					me.pagesCount=me.pagesCount();
					me.index=(me.settings.index>=0 && me.settings.index<me.pagesCount)?me.settings.index:0;
					me.canScroll=true;
					me.oldFocus=0;
					if(!me.direction){
						me._initLayout();
					}
					if(me.settings.pagination){
						me._initPaging();
					}

					me._initEvent();
				},
				/*页面数量*/
				pagesCount:function(){
					return this.section.length;
				},
				/*获取页面的宽度或高度*/
				switchLength:function(){
					return this.direction?this.element.height():this.element.width();
				},
				/*向前滑动 上一页*/
				prev:function(){
					var me=this;
					if(me.index>0){
						me.index--;
					}else if(me.settings.loop){
						me.index=me.pagesCount-1;
					}
					 me._scrollPage('prev');	
				},
				/*向后滑动 下一页*/
				next:function(){
					var me=this;
					if(me.index<me.pagesCount){
						me.index++;
					}else if(me.settings.loop){
						me.index=0;
					}
					me._scrollPage('next');
				},
				/*针对横屏情况进行页面布局*/
				_initLayout:function(){
					var me=this;
					var width=(me.pagesCount*100)+'%';
						cellWidth=(100/me.pagesCount).toFixed(2)+'%';
					me.sections.width(width);
					me.section.width(cellWidth)
					.css('float','left');
				},
				/*实现分页的dom结构以及css样式*/
				_initPaging:function(){
					var me=this;
						pageClass=me.selectors.page.substring(1);
						me.activeClass=me.selectors.active.substring(1);
					var pageHtml="<ul class="+pageClass+">";
					
					for(var i=0;i<me.pagesCount;i++){
						pageHtml +="<li></li>";
					}
					pageHtml+="</ul>";
					me.element.append(pageHtml);
					var pages=me.element.find(me.selectors.page);
					me.pageItem=pages.find("li");
					me.pageItem.eq(me.index).addClass(me.activeClass);

					if(me.direction){
						pages.addClass('vertical');
					}else{
						pages.addClass('horizontal');
					}
				},
				/*初始化插件事件*/
				_initEvent:function(){
					var me=this;
					me.element.on('click',".page li",function(){
						if(me.oldFocus>me.index){
							me._scrollPage('prev');
						}else{
							me._scrollPage('next');
						}

					});

					me.element.on("mousewheel DOMMouseScroll",function(e){
						if(me.canScroll){
							var delta=e.originalEvent.wheelDelta || -e.originalEvent.detail;
							if(delta>0 &&(me.index && !me.settings.loop || me.settings.loop)){
								me.prev();
							}else if(delta<0 && (me.index < (me.pagesCount-1)&& !me.settings.loop || me.settings.loop)){
								me.next();
							}
						}
					});
					if(me.settings.keyboard){
						$(window).on("keyup",function(e){
							var keyCode=e.keyCode;
							if(keyCode==37 || keyCode==38){
								me.prev();
							}else if(keyCode==39 || keyCode==40){
								me.next();
							}
						});
					}
					$(window).resize(function(){
						var currentLength=me.switchLength();
							offset=me.settings.direction?me.section.eq(me.index).top :me.section.eq(me.index).offset().left;
						if(Math.abs(offset)>currentLength/2 && me.index<(me.pagesCount-1)){
							me.index++;
						}
						if(me.index){
							me._scrollPage();
						}
					});

					me.sections.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend',function(){
						me.canScroll=true;
						if(me.settings.callback && $.type(me.settings.callback)=="function"){
							me.settings.callback();
						}
					});
				},
				_scrollPage:function(dir){
					var me=this;	
					me.canScroll=false;
					/*支持tran属性*/
					if(dir==='prev'){
						me.sections.css('background-color',me.section.eq(me.index).css('backgroundColor'));
						me.section.eq(me.index).css({'left':'0',"width":"100%"});
						me.section.eq(me.oldFocus).css({'left':'50%',"width":"0%"});
					}else if(dir==='next'){
						me.sections.css('background-color',me.section.eq(me.oldFocus).css('backgroundColor'));
						me.section.eq(me.oldFocus).css({'left':'50%',"width":"0%"});
						me.section.eq(me.index).css({'left':'0',"width":"100%"});
					}	
					if(me.settings.pagination){
						me.pageItem.eq(me.index).addClass(me.activeClass).siblings().removeClass(me.activeClass);
					}
					me.oldFocus=me.index;
				}
			};
			return PageSwitch;
		})();

		/*单例模式 初始化对象 返回*/
		return this.each(function(){
			var me=$(this),
				instance=me.data('PageSwitch');
			if(!instance){
				instance=new PageSwitch(me,options);
				me.data('PageSwitch',instance);
			}
			if($.type(options)==='string')return instance[options]();
		})
	}
	/*插件默认值*/
	$.fn.PageSwitch.defaults={
		selectors:{
			sections:'.sections',
			section :'.section',
			page:'.page',
			active:'.active'
		},/*插件基本元素*/
		index:0,/*初始页面 */
		easing:'ease-in-out-expo',/*速度曲线*/
		duration:500,/*执行时间*/
		loop:false,/*是否执行循环切换*/
		pagination:true,/*分页*/
		keyboard:true,/*是否进行触发键盘操作*/
		direction:'vertical',/*方向*/
		callback:'' /*回调函数 动画结束后用户自定义调用*/
	}
})(jQuery);

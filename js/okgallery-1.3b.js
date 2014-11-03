/*
 * OKGallery by OKFocus - http://okfoc.us - @okfocus
 * Version 1.2
 * Licensed under MIT.
 *
 */

(function($){
  "use strict";
	var hasCssTransitions;

	$.okgallery = function(el, options){
		var base = this;
		base.$el = $(el);
		base.el = el;
		// Don't load OKGallery twice on an element
		if (base.$el.data("okgallery")) {
			return;
		}
		base.$el.data("okgallery", base);
		base.$children = base.$el.children("div");

		var current = -1;
		
		base.init = function(){
			base.options = $.extend({}, $.okgallery.options, options);
			base.build();
		};
		
		base.build = function(){
			if (base.options.width != null &&
					base.options.height != null &&
					base.options.height > 0) {
				base.options.aspect = base.options.width / base.options.height;
			}
			if (base.options.useTransitions) {
        base.$children.css("opacity", 0);
      }
      else {
        base.$children.first().addClass('present');
        base.$children.not(':first-child').addClass('future');
      }

			base.resize();

			base.buildCss();
			base.buildDots();
			base.bindArrows();
			
			// defer this so the wrapper does not slide open
			setTimeout(base.buildTransitions);
      if (base.options.autoplayOnHover) {
  			base.$el.hover(function(){
          base.autoplayOn();
          base.autoplayTimeout = setTimeout(base.next, 750);
        }, function(){
          base.autoplayOff();
          base.first();
        });
      } else {
  			base.$el.bind("click", base.clickNext);
      }
			$(window).resize(base.debounceResize);
			base.start();
		};
		
		base.bindArrows = function(){
			if (base.options.prevSelector != null) {
				$(base.options.prevSelector).click(base.clickPrev);
			}
			if (base.options.nextSelector != null) {
				$(base.options.nextSelector).click(base.clickNext);
			}
			if (base.options.useKeyboard) {
				$(window).keydown(function(e){
					if (e.keyCode == 37) {
						base.prev();
					} else if (e.keyCode == 39) {
						base.next();
					}
				});
			}
		};

		base.buildCss = function(){
			base.$el.css({
				'width': "100%",
				'position': 'relative',
				'overflow': 'hidden',
				'cursor': 'pointer',
				'WebkitUserSelect': 'none',
				'MozUserSelect': 'none',
				'MsUserSelect': 'none',
				'OUserSelect': 'none',
				'userSelect': 'none'
			});

			base.$children.css({
				'position': "absolute",
				'top': 0,
				'left': 0,
				'width': "100%",
				'height': "100%",
				'backgroundSize': base.options.backgroundSize,
				'backgroundPosition': base.options.backgroundPosition,
				'backgroundRepeat': base.options.backgroundRepeat,
				'WebkitUserSelect': 'none',
				'MozUserSelect': 'none',
				'MsUserSelect': 'none',
				'OUserSelect': 'none',
				'userSelect': 'none'
			});
      if (base.options.aspect == "fullscreen") {
  			base.$el.css({
          'height': "100%",
          'position': "fixed",
          'top': "0",
          'left': "0"
        });
        $("html,body").css({
          'width': '100%',
          'height': '100%',
          'margin': 0,
          'overflow-x': 'hidden'
        });
      }
      if (base.options.aspect == false) {
  			base.$el.css({
          width: ''
        });
      }
      if (base.options.center) {

        // must do this in two steps
        base.$children.css({
          width: '',
          height: '',
          left: '50%',
          top: '50%'
        });

  			base.$children.each(function(){
  			  $(this).css({
            'margin-left': $(this).width()/-2,
            'margin-top': $(this).height()/-2,
          });
        });
      }
		}
		
		base.buildTransitions = function(){
			if (! hasCssTransitions) return;
			if (! base.options.useTransitions) return;

			var transition = {};
			transition[hasCssTransitions + "Property"] = "all"; // "width, height, top, left";
			transition[hasCssTransitions + "Duration"] = (base.options.resizeTime/1000) + "s";
			base.$el.css(transition);

			var fadeTransition = {};
			fadeTransition[hasCssTransitions + "Property"] = "opacity"; // or "all"
			fadeTransition[hasCssTransitions + "Duration"] = (base.options.fadeTime/1000) + "s";
			fadeTransition[hasCssTransitions + "TimingFunction"] = base.options.fadeTimingFunction;

			base.$children.css(fadeTransition);
		};
		
		base.buildDots = function(){
			if (! base.options.dots) return;
			var width = px(base.options.dotWidth);
			var margin = px(base.options.dotMargin);
			var shadow = "0 0 ";
			shadow += px(base.options.dotShadowWidth);
			shadow += " " + base.options.dotShadowColor;

			base.$dotParent = $("<div/>").addClass("dots").css({
				"width": "100%",
				"paddingTop": base.options.dotContainerPadding,
				"paddingBottom": base.options.dotContainerPadding,
				"textAlign": "center",
				'WebkitUserSelect': 'none',
				'MozUserSelect': 'none',
				'MsUserSelect': 'none',
				'OUserSelect': 'none',
				'userSelect': 'none'
			});
			
			base.$children.each(function(index){
				var $dot = $("<a/>");
				$dot.data("index", index)
				$dot.click(base.clickDot);
				
				if (base.options.dotClass) {
					$dot.addClass(base.options.dotClass);
				} else {
				  $dot.addClass("dot").css({
				  	"cursor": "pointer",
				  	"display": "inline-block",
				  	"margin": margin,
						"backgroundColor": base.options.dotColor,
						"width": width,
						"height": width,
						"borderRadius": width,
						"WebkitBorderRadius": width,
						"MozBorderRadius": width,
						"MsBorderRadius": width,
						"OBorderRadius": width,
						"boxShadow": shadow,
						"WebkitBoxShadow": shadow,
						"MozBoxShadow": shadow,
						"MsBoxShadow": shadow,
						"OBoxShadow": shadow
					});
				}
				base.$dotParent.append($dot);
			});
			
			if (base.options.dotsInside) {
				base.$el.append(base.$dotParent);
				base.$dotParent.css({
					'position': 'absolute',
					'bottom': 0,
					'left': 0,
					'zIndex': 1
				});
			} else {
				base.$dotParent.insertAfter(base.$el);
			}
			
			base.$dots = base.$dotParent.children();
		};
		
		base.start = function(){
			base.next();
		};
		
		base.rand = function(n,a) {
			var m = n;
			while (m == n) {
				m = Math.floor(Math.random() * a);
			}
			return m;
		};
		
		base.clickDot = function(e){
			e.preventDefault();
			e.stopPropagation();
			var index = $(this).data("index");
			base.show(index, 1);
			return false;
		};
		
    base.autoplayOn = function(){
		  base.options.autoplay = true;
    };
    base.autoplayOff = function(){
			if (base.autoplayTimeout) clearTimeout(base.autoplayTimeout);
		  base.options.autoplay = false;
    };

		base.clickPrev = function(){
			if (base.options.clickDisablesAutoplay) {
				base.options.autoplay = false;
				clearTimeout(base.autoplayTimeout);
			}
			if (base.options.clickDisablesRandom) {
				base.options.random = false;
			}
			base.prev();
		};
		
		base.clickNext = function(){
			if (base.options.clickDisablesAutoplay) {
				base.options.autoplay = false;
				clearTimeout(base.autoplayTimeout);
			}
			if (base.options.clickDisablesRandom) {
				base.options.random = false;
			}
			base.next();
		};
		
		base.first = function(){
			if (base.options.random) {
				base.show( base.rand(current, base.$children.length), 1 );
			} else {
				base.show( 0, 1 );
			}
		};
		
		base.next = function(){
			if (base.options.random) {
				base.show( base.rand(current, base.$children.length), 1 );
			} else {
				base.show( current + 1, 1 );
			}
		};
		
		base.prev = function(){
			base.show( current - 1, -1 );
		};
		
		base.show = function(index, direction){
			index = (index + base.$children.length) % base.$children.length;

      if (index != current) {
        if (base.options.useTransitions) {
          base.showTransition(index, direction)
        }
        else {
          base.showClass(index, direction)
        }
      }

			if (base.options.dots) {
				if (base.options.dotActiveClass) {
					base.$dots.removeClass(base.options.dotActiveClass);
					base.$dots.eq(index).addClass(base.options.dotActiveClass);
				} else {
					base.$dots.css("background-color", base.options.dotColor);
					base.$dots.eq(index).css("background-color", base.options.dotActiveColor);
				}
			}
			current = index;
    }
    
    base.showClass = function(index, direction) {
      var $index = base.$children.eq(index);
      var $current = base.$children.eq(current);
      var $next = base.$children.eq( (index + base.$children.length + direction) % base.$children.length);
      var $prev = base.$children.eq( (index + base.$children.length - direction) % base.$children.length);
      var is_first = index == 0;
      var is_last = base.$children.last().is($index);

      // next
      if (direction == 1) {
        // console.log(">>>>> NEXT")
//         console.log("current = " + current)
//         console.log("index = " + index)
//         console.log("next = " + (index + base.$children.length + direction) % base.$children.length )
        $current.removeClass("present").css("z-index", "-1");
        $index.removeClass("future past").addClass("present").css("z-index", "auto");
        $next.hide().addClass("future").removeClass("past");
        setTimeout(function(){  
          $next.show()
        }, 100)

        setTimeout(function(){
          $current.hide().removeClass("future").addClass("past").css("z-index", "auto")
          setTimeout(function(){
            $current.show()
          }, 300)
        }, 700)
      }

      // prev
      else {
        // console.log(">>>>> PREV")
//         console.log("current = " + current)
//         console.log("index = " + index)
//         console.log("next = " + (index + base.$children.length + direction) % base.$children.length )
        $current.removeClass("present").css("z-index", "-1");
        $index.removeClass("past future").addClass("present").css("z-index", "auto");
        $next.hide().addClass("past").removeClass("future");
        setTimeout(function(){  
          $next.show()
        }, 100)

        setTimeout(function(){
          $current.hide().removeClass("past").addClass("future").css("z-index", "auto")
          setTimeout(function(){
            $current.show()
          }, 300)
        }, 700)
      }

      setTimeout(function(){
        if (base.options.autoplay) {
          if (base.autoplayTimeout) clearTimeout(base.autoplayTimeout);
          base.autoplayTimeout = setTimeout(base.next, base.options.fadeTime + base.options.delayTime);
        }
      }, base.options.fadePauseTime);
      
      if (base.options.onchange) {
        base.options.onchange(index)
      }
    }
    
    base.showTransition = function(index, direction) {
      if (current > -1) {
        var $current = base.$children.eq(current);
        $current.css("z-index", 0).css("opacity", 0);
        setTimeout(function(){
          $current.hide();
        }, base.options.fadeTime * 1.5);
      }

      var $index = base.$children.eq(index);
      $index.css("opacity", 0).show();
      $index.css("z-index", 1);
      setTimeout(function(){
        $index.css("opacity", 1);

        if (base.options.autoplay) {
          if (base.autoplayTimeout) clearTimeout(base.autoplayTimeout);
          base.autoplayTimeout = setTimeout(base.next, base.options.fadeTime + base.options.delayTime);
        }

      }, base.options.fadePauseTime);
		};
		
		base.autoplayTimeout = null;
		base.debounceTimeout = null;
		base.debounceResize = function(){
			if (base.debounceTimeout) clearTimeout(base.debounceTimeout);
			base.debounceTimeout = setTimeout(base.resize, 100);
		};

		base.resize = function(){
      if (base.options.aspect == "fullscreen") return;
      if (base.options.aspect == false) return;
  		base.el.style.height = Math.floor(base.$el.width() / base.options.aspect) + "px";
		};
		
		base.init();
	};

	hasCssTransitions = (function(){
		var div = document.createElement("div");
		var p, ext, pre = ["msTransition", "OTransition", "WebkitTransition", "MozTransition", "transition"];
		for (p in pre) {
			if (div.style[ pre[p] ] !== undefined) {
				ext = pre[p];
				break;
			}
		}
		return ext;
	})();

	function px (n) {
		if (n.toString().indexOf("px") == -1)
			return n + "px";
		return n;
	}
	
  $.okgallery.options = {
		'aspect': 16/9,
		'center': false,
  	'width': null,
  	'height': null,
		'random': false,
		'autoplay': false,
    'autoplayOnHover': false,
  	'prevSelector': null,
  	'nextSelector': null,
		'clickDisablesRandom': true,
		'clickDisablesAutoplay': true,
		'resizeTime': 200,
		'delayTime': 2000,
		'fadeTime': 700,
		'fadePauseTime': 0,
		'fadeTimingFunction': "ease",
		'backgroundSize': "cover",
		'backgroundPosition': "center center",
		'backgroundRepeat': "no-repeat",
		'dots': true,
		'dotsInside': false,
		'dotClass': null,
		'dotActiveClass': null,
		'dotWidth': 14,
		'dotMargin': 4,
		'dotContainerPadding': 10,
		'dotColor': "#eee",
		'dotShadowColor': "#888",
		'dotShadowWidth': 2,
		'dotActiveColor': "yellow",
		'useKeyboard': false,
		'useTransitions': true,
		'images': null,
		'onchange': function(index){}
  };
  
  $.fn.okgallery = function(options){
    return this.each(function(){
      (new $.okgallery(this, options));            
    });
  };

})(jQuery);
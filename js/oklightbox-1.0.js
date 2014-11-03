$(function(){

	var template = [
		'<div id="lightbox_curtain"></div>',
		'<div id="lightbox">',
			'<img id="lightbox_loading" src="http://okfoc.us/300/oklightbox/img/loading.gif">',
			'<div id="lightbox_cell">',
				'<img id="lightbox_image">',
			'</div>',
			'<div id="lightbox_prev"></div>',
			'<div id="lightbox_next"></div>',
			'<div id="lightbox_close"></div>',
			'<div id="lightbox_caption"></div>',
		'</div>'].join("");

	$("body").append(template)

	var $lightbox = $("#lightbox"),
		$cell = $("#lightbox_cell")
		$image = $("#lightbox_image"),
		$caption = $("#lightbox_caption"),
		$loading = $("#lightbox_loading"),
		$curtain = $("#lightbox,#lightbox_curtain"),
		$prev = $("#lightbox_prev"),
		$next = $("#lightbox_next"),
		$close = $("#lightbox_close")

  $.oklightbox = function(el, options){

		var base = this,
			options = $.extend({}, $.oklightbox.options, options),
			$el = base.$el = $(el),
			$thumbs = $el.children(options.selector)

		$curtain.css("z-index", options.z_index)
		$lightbox.css("z-index", options.z_index+1)
		
    if ($el.data("oklightbox")) return
    $el.data("oklightbox", base);

  	var Lightbox = {

  		current: null,
  		index: -1,
  		data: [],

			init: function() {
				$el.data("oklightbox", Lightbox)

				$thumbs.each(function(index){
					Lightbox.data.push($(this).data())
					$(this).click(function(){
						Lightbox.bind()
						Lightbox.show()
						Lightbox.choose(index)
						Lightbox.preloadNext()
						Lightbox.preloadPrev()
					})
				})
			},

			bind: function() {
				$loading.attr("src", options.loading_image)
				$image.bind("click", Lightbox.next);
				$cell.bind("click", Lightbox.hide);
				$prev.bind("click", Lightbox.prev);
				$next.bind("click", Lightbox.next);
				$close.bind("click", Lightbox.hide);
				$image.bind("load", Lightbox.loaded );
				$(window).bind("resize", Lightbox.resize );
			},

			unbind: function() {
				$image.unbind("click", Lightbox.next);
				$cell.unbind("click", Lightbox.hide);
				$prev.unbind("click", Lightbox.prev);
				$next.unbind("click", Lightbox.next);
				$close.unbind("click", Lightbox.hide);
				$image.unbind("load", Lightbox.loaded );
				$(window).unbind("resize", Lightbox.resize );
			},

			choose: function(index){
				Lightbox.index = (index + $thumbs.length) % $thumbs.length
				Lightbox.current = Lightbox.data[Lightbox.index]
				Lightbox.update()
			},

			prev: function(e) {
				e && e.stopPropagation()
				Lightbox.choose(Lightbox.index-1)
				Lightbox.preloadPrev()
			},
			preloadPrev: function(){
				if (Lightbox.index-1 < 0) return
				var preload = new Image ()
				preload.src = Lightbox.data[Lightbox.index-1].url
			},

			next: function(e) {
				e && e.stopPropagation()
				Lightbox.choose(Lightbox.index+1)
				Lightbox.preloadNext()
			},
			preloadNext: function(){
				if (Lightbox.index+1 > Lightbox.data.length) return
				var preload = new Image ()
				preload.src = Lightbox.data[Lightbox.index+1].url
			},

			update: function() {
				$loading.css({
					top: Math.floor(($(window).height() - 16) / 2),
					left: Math.floor(($(window).width() - 16) / 2),
					zIndex: options.z_index
				})
				$image.stop(true).animate({"opacity": 0.01}, options.load_transition, function(){
					$loading.fadeIn(100)
				});

				if (okzoom) {
				  okzoom.mouseout(okzoom, last_mouse_event)
				}

				$image.attr("src", Lightbox.current.url);
				if ($image[0].complete) {
					Lightbox.loaded()
				}
				
				var caption = Lightbox.current.caption || ''
				if (caption.length) caption += '<br><br>'
				caption += '<a href="' + Lightbox.current.original +'">Download full size</a>'
				$caption.html(caption);
			},

			loaded: function () {
				$loading.stop().fadeOut(100);
				Lightbox.resize()

				$image.stop(true).animate({"opacity": 1.0}, options.load_transition);
				options.onload && options.onload(Lightbox.current)

				if (okzoom && last_mouse_event) {
				  okzoom.build()
				  okzoom.mousemove(last_mouse_event)
				}
			},
			
			resize: function () {
				var margin = Math.floor( ($(window).height() - $image.height() 	- 10) / 2 );
				$image.css({"margin-top": margin});
			},

			show: function(e) {
				okzoom = $image.data("okzoom")
				$image.css("opacity", 0.0)
				$lightbox.css("display", "table").hide();
				$curtain.fadeIn(options.show_transition);
				Keymap.bind();
			},

			hide: function(e) {
				$curtain.fadeOut(options.hide_transition)
				$loading.fadeOut(options.hide_transition, function(){
					if (okzoom) {
						okzoom.initialized = false
						okzoom.mouseout(okzoom, last_mouse_event)
					}
				})
				Keymap.unbind();
				Lightbox.unbind();
				if (okzoom) {
				  okzoom.initialized = false
				  okzoom.mouseout(okzoom, last_mouse_event)
				}
			}
		}

		var Keymap = {
			keydown: function (e) {
				switch(e.keyCode){
					case 27: // ESC
						Lightbox.hide();
						break;
					case 37: // LEFT
						Lightbox.prev();
						break;
					case 39: // RIGHT
						Lightbox.next();
						break;
				}
			},
			bind: function () {
				$(window).bind("keydown", Keymap.keydown);
			},
			unbind: function(){
				$(window).unbind("keydown", Keymap.keydown);
			},
		}

		Lightbox.init()
  }

	var okzoom, last_mouse_event;
	$image.mousemove(function(e){
		last_mouse_event = e
	})
	$image.mouseout(function(e){
		last_mouse_event = null
	})

  $.oklightbox.options = {
  	selector: "img",
  	show_transition: 100,
  	load_transition: 100,
  	hide_transition: 300,
  	z_index: 100,
  	onload: function(){},
  	loading_image: "http://okfoc.us/300/oklightbox/img/loading.gif",
  }

  $.fn.oklightbox = function(options){
    return this.each(function(){
      (new $.oklightbox(this, options));
    });
  };

})

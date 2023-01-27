
var styles = "\
#brks_addon_text * {font-family:arial;color:black;font-size:12pt;line-height: 1.3em;} \
#brks_addon_text {font-family:arial;position:absolute;background:white;display:none;padding:10px;border-radius:8px; moz-border-radius:8px;font-size:12pt;border:1px solid gray;z-index:2147483647;box-shadow: 0 0 5px 5px #999;-moz-box-shadow: 0 0 5px 5px #999;-webkit-box-shadow: 0 0 5px 5px #999;max-width:1000px;}\
#brks_addon_text #word_ch {font-size:17pt;font-family:KaiTi,simsun,Nsimsun,arial unicode MS, sans-serif,arial;}\
#brks_addon_text #word_py {font-size:14pt;}\
#brks_addon_text .m1{margin-left:0.5em}\
#brks_addon_text .m2{margin-left:1em}\
#brks_addon_text .m3{margin-left:1.5em}\
#brks_addon_text .ex {color:#666666}\
#brks_addon_text a {color:darkblue;text-decoration:none}\
#brks_addon_text a:hover {color:#BF9631;text-decoration:none}\
#brks_addon_text a.w_bad {color:#6b6b6b}\
#brks_addon_text a.w_bad:hover {color:black}\
#brks_addon_text a.bkrs_black {color:black}\
#brks_addon_text .ch3 {text-align:center;font-size:20pt;font-family:KaiTi,simsun,Nsimsun,arial unicode MS, sans-serif,arial;}\
#brks_addon_text .vtop {vertical-align:top}\
#brks_addon_text .ch_font {font-family:KaiTi,simsun,Nsimsun,arial unicode MS, sans-serif,arial;}\
#brks_addon_text .too_long {position:absolute;width:247px;padding-bottom:5px;border-bottom:1px solid gray;padding-left:3px}\
#brks_addon_text .td_word_hover {background:#f8f8f8;}\
#brks_addon_text .tbl_bywords {border-collapse:collapse}\
#brks_addon_text .tbl_bywords td {padding:0 3px}\
#brks_addon_text .hidden {display:none}\
#brks_addon_text .gray {color:gray}\
#brks_addon_text .green {color:green}\
#brks_addon_text .pt10 {font-size:10pt}\
#brks_addon_text .pt14 {font-size:14pt}\
#brks_addon_text .pt16 {font-size:16pt}\
#brks_addon_text .pt18 {font-size:18pt}\
#brks_addon_text .pt20 {font-size:20pt}\
";

var bkrs_addon_can_close = 1;
var brks_version = '2.0';
var bkrs_selection = '';
var position_top = 0;
var cache = {};
var stats_queries = 0;
var text = '';
var included = 0;

var state = 0;

// что это? не доделано?
//chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//	state = request.state;
//});

$(document.body).bind('mouseup', function(e) {
	chrome.storage.local.get('state', function (data) {
		if ( typeof data.state === 'undefined' || data.state == 1 && window.getSelection().toString() != '' ) {

			text = window.getSelection().toString();
			text = $.trim(text);


			// check if textarea or input
			if ( text == '' )
			{
				var $focused = $(':focus');
				if ( $focused.is("input") || $focused.is("textarea") )
				{
					var text_data = $focused.getSelection();
					if ( text_data['length'] )
						text = text_data['text'];
				}
			}

			// gogogo
			if ( text != '' && text.length < 60 && /[\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d]/.test(text) )
			{

				if ( included == 0 ) {
					$("head").append("<style id='bkrs_styles'>"+styles+"</style>");
					$('body').append("<div id='brks_addon_text'></div>");
					included = 1;
				}

				position_top = e.pageY + 40;

				// cache
				if ( text in cache ) {
					result_show(cache[text]);
				}
				else {
					// stats
					stats_queries = stats_queries + 1;

					// get from bkrs.info
					// todo: move to background
					var xhr = new XMLHttpRequest();
					xhr.open("GET", "https://dabkrs.com/addon.php?text="+encodeURIComponent(text)+"&version=3.0&browser=chrome", true);
//					xhr.open("GET", "http://localhost/qiaojiao/public_html/bkrs.info/addon.php?text="+encodeURIComponent(text)+"&version=3.0&browser=chrome", true);
					xhr.onreadystatechange = function() {
						if (xhr.readyState == 4) {
							data = jQuery.parseJSON(xhr.responseText);
							cache[text] = data;

							result_show(data);
						}
					}
					xhr.send();
				} // cache
			}
			else
				$('#brks_addon_text').hide();
		} // end storage get callback
	}); // end storage get
});


$('body').mouseup(function()
{
	if ( bkrs_addon_can_close == 1 )
		$('#brks_addon_text').hide();
});

// show
function result_show(data) {
	$('#brks_addon_text').html("<div>"+data.data+"</div>").show();
	$('#brks_addon_text').css({top: position_top, left: 20});

	bkrs_addon_can_close = 1;
//	var timerId = setTimeout(function() { bkrs_addon_can_close = 1 }, 500);
}



// hover td for byword
$('body').on('mouseenter', '#brks_addon_text td[i]', function() {
	// highlite table
	$(this).closest('table').find('td:nth-child(' + ($(this).index() + 1) + ')').addClass('td_word_hover');

	var word = $('#brks_addon_text').find('#word_this').attr('word_this');

	// highlite word
	var index = $(this).attr('i').split(',');
	var start = index[0];
	var end = index[1];

	var result = word.substring(0, start) + '<span class="ch3 pr25" style="color:red">' + word.substring(start, end) + '</span>' + word.substring(end);

	$('#brks_addon_text').find('#word_this').html(result);
});
$('body').on('mouseleave', '#brks_addon_text td[i]', function() {
	$(this).closest('table').find('td.td_word_hover').removeClass('td_word_hover');
});


// show hidden
$('body').on('mouseenter', '#brks_addon_text .not_full', function() {
	$(this).find('.hidden').slideToggle('fast');
	$(this).find('.link_show').css('visibility', 'hidden');
});
$('body').on('mouseleave', '#brks_addon_text .not_full', function() {
	$(this).find('.hidden').slideToggle('fast');
	$(this).find('.link_show').css('visibility', 'visible');
});
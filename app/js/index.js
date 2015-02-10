$(document).on("click", ".btn-pitch-default", function(){
	$(this).parent().children().removeClass('btn-success');
    $(this).addClass('btn-success');
});

$(document).on("click", ".btn-zone", function(){
	$(this).parent().parent().children().children().removeClass('btn-success');
    $(this).addClass('btn-success');
});

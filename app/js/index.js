$(document).on("click", ".btn-pitch-outcome", function(){
	$(this).parent().children().removeClass('active');
    $(this).addClass('active');
});

$(document).on("click", ".btn-pitch-type", function(){
	$(this).parent().children().removeClass('active');
    $(this).addClass('active');
});

$(document).on("click", ".btn-zone", function(){
	$(this).parent().children().removeClass('active');
    $(this).addClass('active');
});

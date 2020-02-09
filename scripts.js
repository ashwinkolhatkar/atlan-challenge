$(function () {
    // form validation
    $("#submit_btn").click(function () {
        console.log('Submission done')
        // validate and process form here
        $('.error').hide();
        var drlb = $("input#drlb").val();
        if (drlb == "") {
            //$("label#name_error").show();
            $("input#drlb").focus();
            return false;
        }
        var drub = $("input#drub").val();
        if (drub == "") {
            //$("label#email_error").show();
            $("input#drub").focus();
            return false;
        }
        var phone = $("input#update_val").val();
        if (phone == "") {
            //$("label#phone_error").show();
            $("input#update_val").focus();
            return false;
        }


        // Now that form validation is done, we can send the POST request.
        var dataString = 'drlb=' + drlb + '&drub=' + drub + '&update_val=' + update_val;
        //alert (dataString);return false;
        $.ajax({
            type: "POST",
            url: "/getData",
            data: dataString,
            success: function () {
                $('#data_form').html("<div id='message'></div>");
                $('#message').html("<h2>Contact Form Submitted!</h2>")
                    .append("<p>We will be in touch soon.</p>")
            }
        });
        return false;

    });


    // 

});
document.querySelector("#form").addEventListener("submit", function (event) {
    event.preventDefault();

    if (grecaptcha.getResponse() === "") {
        alert("Faut cocher le captcha");
        return;
    }

    let formData = $("form").get(0);
    let form = {
        anonymous: document.getElementById("checkbox").checked,
        name: formData[1].value,
        message: formData[2].value,
        captcha: grecaptcha.getResponse(),
    };

    $.ajax({
        url: "/addForm",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(form),
        success: (callback) => {
            if (callback) {
                alert("J'ai bien reçu ton message");
            } else {
                alert("Erreur dans ton message :(");
            }
            grecaptcha.reset();
        },
    });

    $("form").get(0).reset();


}, false);

$(document).ready(() => {
    $("#checkbox").change(() => {
        if (document.getElementById("checkbox").checked) {
            document.getElementById("inputName").disabled = true;
            document.getElementById("inputName").required = false;
        } else {
            document.getElementById("inputName").disabled = false;
            document.getElementById("inputName").required = true;
        }
    });
});



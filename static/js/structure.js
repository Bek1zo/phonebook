$(document).ready(
    function(){
        $("button[name='viewstruct']").on("click", function () {showStruct();});
        buildDeparts();
        $("pre[name=structurez]").css('display', 'none');
    }
)

function buildDeparts(){
    var structContainer = $("pre[name=structurez]");

    $("pre:contains('\f')").each(function(){
        if ($(this).attr('id').toString().slice(-2) === '_2'){
            // structContainer.append($(this).clone());
            let clone = $(this).clone()
            let anchor = $(this).attr('id');
            let color = $(this).css('color')
            // console.log(color)
            // structContainer.append("\r\n<br>");
            structContainer.append("<p><a href='#" + anchor + "' style='color: " + color + "'>" + clone.text() +"</a></p>")
        }
    });

    $("pre[name=structurez] p a").each(function(){
        $(this).on('click', function(){
            hideStruct();
        })
    })
}

// $("pre[name=structurez] pre").each(function(){
//     var anchor = $(this).attr('id');
//     $(this).wrap("<a href='#" + anchor + "'></a>").on('click', function(){
//         hideStruct();
//     });
// });


function hideStruct()
{
    $("div[name=phonez]").css('display', 'block');
    $("pre[name=structurez]").css('display', 'none');
}

function showStruct()
{
    $("pre[name=structurez]").css('display', 'block');
    $("div[name=phonez]").css('display', 'none');
}

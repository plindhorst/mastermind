var count=Number(readCookie())+1;
createCookie(count);
if (count==1) {
    document.getElementById('p4').innerHTML="This is your first time here.";
}
else{
    document.getElementById('p4').innerHTML="You have been here "+count+" times.";
}

function createCookie(i) {
    document.cookie = "cc="+i;
}

function readCookie() {
    if (document.cookie!="") {
        var cookies=document.cookie;
        var length= cookies.length-cookies.indexOf("=");
        var count= cookies.substr(cookies.indexOf("=")+1, length);
        return count;
    }
    return 0;
}

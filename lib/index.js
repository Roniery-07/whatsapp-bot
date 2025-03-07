module.exports.handleNumber = function(reqNumber){
    const number = reqNumber.replace(/\D/g,'');
    const numberDDD = number.substr(0, 2);
    const numberUser = number.substr(-8, 8);

    return [number, numberDDD, numberUser]
}

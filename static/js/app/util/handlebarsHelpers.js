define([
    'Handlebars',
    'app/util/ajax',
    'app/util/dict'
], function( Handlebars, Ajax, Dict) {
    Handlebars.registerHelper('formatMoney', function(num, options){
        if(!num && num !== 0)
            return "--";
        num = +num;
        return (num / 1000).toFixed(2);
    });
    Handlebars.registerHelper('formatZeroMoney', function(num, places, options){
        if (typeof num == 'undefined' || typeof num != 'number') {
            return 0;
        }
        num = +(num || 0) / 1000;
        return num.toFixed(0);
    });

    Handlebars.registerHelper('compare', function(v1, v2, res1, res2, res3, options){
        if (v1 > v2) {
            return res1;
        } else if (v1 = v2) {
            return res2;
        } else {
            return res3;
        }
    });

    Handlebars.registerHelper('safeString', function(text, options){
        return new Handlebars.SafeString(text);
    });
    Handlebars.registerHelper('formatImage', function(pic, isAvatar, options){
        var defaultAvatar = __inline("../images/default-avatar.png");
        if(pic){
            pic = pic.split(/\|\|/)[0];
        }
        if(!/^http/i.test(pic)){
            pic = pic ? (PIC_PREFIX + pic + PHOTO_SUFFIX) :
            (isAvatar && !isAvatar.name) ? defaultAvatar : "";
        }
        return pic;
    });
    Handlebars.registerHelper('formatImageAvatar', function(pic, isAvatar, options){
        var defaultAvatar = __inline("../images/default-avatar.png");
        if(pic){
            pic = pic.split(/\|\|/)[0];
        }
        if(!/^http/i.test(pic)){
            pic = pic ? (PIC_PREFIX + pic + PHOTO_SUFFIX) :defaultAvatar;
        }
        return pic;
    });
    Handlebars.registerHelper('formatListImage', function(pic, options){
    	var defaultImg = "";
        if(!pic)
            return defaultImg;
        pic = pic.split(/\|\|/)[0];
        return (PIC_PREFIX + pic + '?imageMogr2/auto-orient/thumbnail/!280x175r');
    });
    Handlebars.registerHelper('formateDatetime', function(date, options){
        return date ? new Date(date).format("yyyy-MM-dd hh:mm:ss") : "--";
    });
    Handlebars.registerHelper('formateDate', function(date, options){
        return date ? new Date(date).format("yyyy-MM-dd") : "--";
    });
    Handlebars.registerHelper('formateCNDate', function(date, options){
        return date ? new Date(date).format("yyyy年MM月dd日") : "--";
    });
    Handlebars.registerHelper('formatePointDate', function(date, options){
        return date ? new Date(date).format("yyyy.MM.dd") : "--";
    });
    Handlebars.registerHelper('formateTime', function(date, options){
        return date ? new Date(date).format("hh:mm") : "--";
    });
    Handlebars.registerHelper('clearTag', function(des, options){
        return des && des.replace(/(\<[^\>]+\>)|(\<\/[^\>]+\>)|(\<[^\/\>]+\/\>)/ig, "") || "";
    });
    Handlebars.registerHelper('formatAddress', function(addr, options){
        if(!addr)
            return "";
        var province = options.data.root.items[0].province,
            city = options.data.root.items[0].city,
            area = options.data.root.items[0].area,
            address = options.data.root.items[0].detail;
        if(province == city){
            province = "";
        }
        return province + city + area +" "+ address;
    });
    Handlebars.registerHelper('format2line', function(cont, options){
        return cont
            ? cont.length > 40
                ? cont.substring(0, 40) + "..."
                : cont
            : "";
    });
    Handlebars.registerHelper('formatHotelRoomDescription', function(desc, options){
    	var distData = Dict.get("hotelRoomDescription")
    	var desc = desc.split(",");
    	var val = ""
    	desc.forEach(function(d,i){
    		val += distData[d]+" "
    	})
    	return val;
    });
    

    return Handlebars;
});

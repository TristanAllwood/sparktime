function SparkTime(key_data, attributes) {
  var self = this;

  var core_data = {};

  var now = new Date();

  var min_date = undefined;
  var max_date = undefined;

  for(var k in key_data) {
    d = key_data[k];
    core_data[k] = d;

    var min_d = new Date(d.getTime());
    min_d.setHours(0,0,0,0);
    var max_d = new Date(d.getTime());
    max_d.setHours(23,59,59,999);

    if (min_date) {
      min_date = new Date(Math.min(min_date, min_d));
    } else {
      min_date = min_d;
    }

    if (max_date) {
      max_date = new Date(Math.max(max_date, max_d));
    } else {
      max_date = max_d;
    }
  }

  var range = max_date - min_date;

  var ONE_DAY = 1000 * 60 * 60 * 24;
  var HOURS_DAY = 24;
  var DAY_WIDTH = HOURS_DAY / 4;

  var numberOfDays = Math.ceil(range / ONE_DAY);

  var width = numberOfDays * DAY_WIDTH;
  var height = 5;

  var renderDays = function(ctx) {
    /* render the days in alternating colours */
    for(var i = 0  ; i < numberOfDays ; i++) {
      /* make sure weekends are darker */
      var currentDay = new Date(min_date.getTime());
      currentDay.setDate(currentDay.getDate() + i);

      /* sunday or saturday */
      if (currentDay.getDay() == 0 || currentDay.getDay() == 6) {
        ctx.fillStyle = "#EFEFEF";
      } else {
        ctx.fillStyle = "#E0E0E0";
      }
      ctx.fillRect(i * DAY_WIDTH, 0, DAY_WIDTH, height);
    }
  }

  var renderNow = function(ctx) {
    /* does right now fall between two points? */
    /* if so render it in yellow */
    if (now > min_date && now < max_date) {
      ctx.beginPath();
      var offset = Math.round(((now - min_date) / ONE_DAY) * DAY_WIDTH);
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset, height);
      ctx.strokeStyle = "rgba(255,125,0,0.3)";
      ctx.stroke()
    }
  }

  var renderKeys = function(ctx) {
    /* render the keys in red */
    ctx.beginPath();
    for(var k in core_data) {
      var offset = Math.round(((core_data[k] - min_date) / ONE_DAY) * DAY_WIDTH);
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset, height);
    }
    ctx.strokeStyle = "#FF0000";
    ctx.stroke();
  }

  this.apply = function(elem, data) {
    var newCanvas = $('<canvas/>',{'class':'sparktime'}).attr({'width':width,'height':height});

    var ctx=newCanvas[0].getContext("2d");
    ctx.globalAlpha = 1.0;
    ctx.lineWidth = 2;

    var newPara = $('<p/>', {'class':'sparktime-info', 'style': 'position: absolute'})
    newPara.hide();

    var render = function() {
      renderDays(ctx);
      renderNow(ctx);
      renderKeys(ctx);

      /* render the local data in black */
      ctx.beginPath();
      for(var k in attributes) {
        for (var v in data[attributes[k]]) {
          var time = new Date(data[attributes[k]][v]);

          var offset = Math.round(((time - min_date) / ONE_DAY) * DAY_WIDTH);
          ctx.arc(offset, height/2, height / 3, 0, 2*Math.PI);
        }
      }
      ctx.fillStyle = "#000000";
      ctx.fill();
    }

    newCanvas.mouseenter(function() {
    });

    newCanvas.mouseleave(function() {
      newPara.hide();
    });

    newCanvas.mousemove(function(ev) {
      var xpos = ev.pageX - newCanvas.offset().left;
      var time = new Date(Math.round(((xpos * ONE_DAY) / DAY_WIDTH) + min_date.getTime()));
      newPara.text(time);
      newPara.show();
    });

    render();

    var all = $('<div/>');
    all.append(newCanvas);
    all.append(newPara);

    elem.replaceWith(all);
  }

}

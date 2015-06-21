var ffmpeg = require('fluent-ffmpeg');
var _ = require('lodash');
module.exports = function(){
    var that = this;
    that.queue = [];
    that.running = false;
    that.setup = function(input, output) {
        ffmpeg.ffprobe(input, function(err, metadata){
            console.log(metadata);
        })
        that.queue.push({
            input : input,
            output : output,
            ffmpeg : ffmpeg(input)
                .videoCodec('libx264')
                .audioCodec('libfdk_aac')
                //.audioQuality(100)
                //.videoFilters('scale=-1:720')
                .outputOptions([
                    //'-crf 21',
                    //'-level 3.1',
                    //'-preset slow',
                    //'-tune film',
                    '-movflags faststart',
                    '-pix_fmt yuv420p'
                    //'-vbr 5'
                ])
                .output(output)
                .on('progress', function (info) {
                    console.log('progress ' + Math.floor(info.percent) + '%');
                })
                .on('end', function () {
                    console.log('done processing input stream');
                    var source = this.options.source;

                    that.queue = _.reject(that.queue, { input : source });
                    that.running = false;
                    that.run();
                })
                .on('error', function (err) {
                    console.log('an error happened: ' + err.message);
                })
        });
    }

    that.run = function(){
        if(!that.running && that.queue.length > 0){
            that.queue[0].ffmpeg.run();
        } else {
            console.log('All encoding jobs are now finished. Terminating..');
        }
    };

    return that;
}

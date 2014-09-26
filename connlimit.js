'use strict';

function connLimit(server, maxConcurrentRequests, opts) {
    opts = opts || {};
    var max = maxConcurrentRequests;
    var current = 0;
    var onLimit = opts.onLimit || function () {};

    server.on(
        'connection',
        function (socket) {
            if (current >= max) {
                // Close the connection without responding.
                socket.destroy();
                onLimit(socket);
                return;
            }
            socket.on(
                'close',
                function () {
                    current--;
                }
            );
            current++;
        }
    );
}

module.exports = connLimit;

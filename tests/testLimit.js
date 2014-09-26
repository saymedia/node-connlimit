
var connLimit = require('../connlimit.js');
var sinon = require('sinon');

module.exports = {

    testLimit: function (test) {

        var EventEmitter = require('events').EventEmitter;
        var mockServer = new EventEmitter();
        var onLimit = sinon.spy();

        connLimit(
            mockServer, 3,
            {
                onLimit: onLimit
            }
        );

        var mockSockets = [];
        for (var i = 0; i < 3; i++) {
            var mockSocket = new EventEmitter();
            mockServer.emit('connection', mockSocket);
            test.ok(! onLimit.called, 'onLimit not called yet');
            mockSockets.push(mockSocket);
        }

        // Try to connect when the server is at capacity.
        var mockRejectedSocket = new EventEmitter();
        mockRejectedSocket.destroy = sinon.spy();

        mockServer.emit('connection', mockRejectedSocket);

        test.ok(mockRejectedSocket.destroy.called, 'Socket was rejected');
        test.ok(onLimit.called, 'onLimit was called');

        // Close one of our initial sockets.
        mockSockets[0].emit('close');

        // Try to connect again, now that we're back under capacity.
        var mockAcceptedSocket = new EventEmitter();
        mockAcceptedSocket.destroy = sinon.spy();
        mockServer.emit('connection', mockAcceptedSocket);
        test.ok(! mockAcceptedSocket.destroy.called, 'Socket was not rejected');

        test.done();

    }

};

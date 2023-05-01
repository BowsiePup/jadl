"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const v9_1 = require("discord-api-types/v9");
/**
 * Structure in charge of managing Discord communcation over websocket
 */
class DiscordSocket {
    constructor(shard) {
        this.shard = shard;
        this.sequence = null;
        this.sessionID = null;
        this.hbInterval = null;
        this.waitingHeartbeat = false;
        this.heartbeatRetention = 0;
        this.ws = null;
        this.connected = false;
        this.resuming = false;
        this.dying = false;
        this.selfClose = false;
        this.op7 = false;
    }
    close(code, reason, report = true) {
        if (!this.op7)
            this.shard.worker.log(`Shard ${this.shard.id} closing with ${code} & ${reason}`);
        if (report)
            this.selfClose = true;
        this.ws?.close(code, reason);
    }
    async spawn() {
        this.shard.worker.debug(`Shard ${this.shard.id} is spawning`);
        if (this.ws && this.ws.readyState === ws_1.default.OPEN)
            this.close(1012, 'Starting again', false);
        this.ws = null;
        this.connected = false;
        this.heartbeatRetention = 0;
        this.waitingHeartbeat = false;
        this.dying = false;
        if (this.hbInterval)
            clearInterval(this.hbInterval);
        try {
            this.ws = new ws_1.default(this.shard.worker.options.ws + '?v=9');
        }
        catch (err) {
            if (this.connectTimeout)
                clearTimeout(this.connectTimeout);
            this.shard.restart(true, 1013);
        }
        this.connectTimeout = setTimeout(() => {
            if (!this.connected)
                return this.shard.restart(true, 1013, 'Didn\'t Connect in Time');
        }, 120000);
        this.ws
            ?.on('message', (data, isBuffer) => {
            this._handleMessage(isBuffer ? data.toString('utf-8') : data);
        })
            .once('close', (code, reason) => this.onClose(code, reason.toString('utf-8')))
            .on('error', (err) => this.shard.worker.debug(`Received WS error on shard ${this.shard.id}: ${err.name} / ${err.message}`));
    }
    _send(data) {
        if (this.ws?.readyState !== this.ws?.OPEN)
            return;
        this.ws?.send(JSON.stringify(data));
    }
    _handleMessage(data) {
        const msg = JSON.parse(data);
        if (msg.s)
            this.sequence = msg.s;
        if (msg.op === v9_1.GatewayOpcodes.Dispatch) {
            if ([v9_1.GatewayDispatchEvents.Ready, v9_1.GatewayDispatchEvents.Resumed].includes(msg.t)) {
                if (msg.t === v9_1.GatewayDispatchEvents.Resumed) {
                    if (this.op7) {
                        this.op7 = false;
                    }
                    else
                        this.shard.worker.log(`Shard ${this.shard.id} resumed at sequence ${this.sequence ?? 0}`);
                }
                this.connected = true;
                this.resuming = false;
                clearTimeout(this.connectTimeout);
            }
            if (msg.t === v9_1.GatewayDispatchEvents.Ready)
                this.sessionID = msg.d.session_id;
            void this.shard.emit(msg.t, msg.d);
            this.shard.worker.emit('*', msg);
            if ([v9_1.GatewayDispatchEvents.Ready, v9_1.GatewayDispatchEvents.GuildCreate, v9_1.GatewayDispatchEvents.GuildDelete].includes(msg.t))
                return;
            this.shard.worker.emit(msg.t, msg.d);
        }
        else if (msg.op === v9_1.GatewayOpcodes.Heartbeat) {
            this._heartbeat();
        }
        else if (msg.op === v9_1.GatewayOpcodes.Reconnect) {
            this.op7 = true;
            this.shard.restart(false, 1012, 'Opcode 7 Restart');
        }
        else if (msg.op === v9_1.GatewayOpcodes.InvalidSession) {
            setTimeout(() => {
                if (!this.resuming)
                    this.shard.restart(!msg.d, 1002, 'Invalid Session');
                else {
                    this.shard.worker.debug(`Shard ${this.shard.id} could not resume, sending a fresh identify`);
                    this.resuming = false;
                    this._sendIdentify();
                }
            }, Math.ceil(Math.random() * 5) * 1000);
        }
        else if (msg.op === v9_1.GatewayOpcodes.Hello) {
            if (this.resuming && (!this.sessionID || !this.sequence)) {
                this.shard.worker.debug('Cancelling resume because of missing session info');
                this.resuming = false;
                this.sequence = null;
                this.sessionID = null;
            }
            this.shard.worker.debug(`Received HELLO on shard ${this.shard.id}. ${this.resuming ? '' : 'Not '}Resuming. (Heartbeat @ 1/${msg.d.heartbeat_interval / 1000}s)`);
            if (this.resuming) {
                this._send({
                    op: v9_1.GatewayOpcodes.Resume,
                    d: {
                        token: this.shard.worker.options.token,
                        session_id: this.sessionID,
                        seq: this.sequence
                    }
                });
            }
            else {
                this._sendIdentify();
            }
            this.hbInterval = setInterval(() => this._heartbeat(), msg.d.heartbeat_interval);
            this.waitingHeartbeat = false;
            this.heartbeatRetention = 0;
            this._heartbeat();
        }
        else if (msg.op === v9_1.GatewayOpcodes.HeartbeatAck) {
            this.shard.worker.debug(`Heartbeat acknowledged on shard ${this.shard.id}`);
            this.heartbeatRetention = 0;
            this.shard.ping = Date.now() - this.waitingHeartbeat;
            this.waitingHeartbeat = false;
            this.heartbeatRetention = 0;
        }
    }
    _sendIdentify() {
        this._send({
            op: v9_1.GatewayOpcodes.Identify,
            d: {
                shard: [this.shard.id, this.shard.worker.options.shards],
                intents: this.shard.worker.options.intents,
                token: this.shard.worker.options.token,
                properties: {
                    $os: 'linux',
                    $browser: 'JADL',
                    $device: 'bot'
                }
            }
        });
    }
    _heartbeat() {
        this.shard.worker.debug(`Heartbeat @ ${this.sequence ?? 'none'}. Retention at ${this.heartbeatRetention} on shard ${this.shard.id}`);
        if (this.waitingHeartbeat) {
            this.heartbeatRetention++;
            if (this.heartbeatRetention > 5)
                return this.shard.restart(false, 1012, 'Not Receiving Heartbeats');
        }
        this._send({
            op: v9_1.GatewayOpcodes.Heartbeat,
            d: this.sequence
        });
        this.waitingHeartbeat = Date.now();
    }
    onClose(code, reason) {
        this.shard.emit('CLOSED', code, reason);
        if (this.selfClose) {
            this.shard.worker.debug(`Self closed with code ${code}`);
            this.selfClose = false;
        }
        else
            this.shard.worker.log(`Shard ${this.shard.id} closed with ${code} & ${reason || 'No Reason'}`);
        if (code === 1006)
            this.resuming = true;
        if (this.dying)
            void this.shard.register();
        else
            void this.spawn();
    }
    kill() {
        this.dying = true;
        this.resuming = false;
        this.sequence = null;
        this.sessionID = null;
    }
}
exports.DiscordSocket = DiscordSocket;

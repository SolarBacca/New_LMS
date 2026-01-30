import { globalEmitter } from "~~/server/utils/emitter";

export default defineEventHandler(async (event) => {
    setResponseHeaders(event, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
    });

    const stream = event.node.res;

    const sendEvent = (data: any) => {
        stream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const onNewMessage = (msg: any) => {
        sendEvent({ type: "new_message", topicId: msg.topicId });
    };

    globalEmitter.on("new_message", onNewMessage);

    const interval = setInterval(() => {
        stream.write(": keep-alive\n\n");
    }, 30000);

    event.node.req.on("close", () => {
        clearInterval(interval);
        globalEmitter.off("new_message", onNewMessage);
        stream.end();
    });

    return new Promise(() => {});
});

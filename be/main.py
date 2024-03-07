from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import logging, time

logger = logging.getLogger()

from pydantic import BaseModel


class ChatMsg(BaseModel):
    content: str


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/stream", response_class=StreamingResponse)
def message_stream(msg: ChatMsg):
    logger.debug(f"in message_stream : msg = {msg.content}")

    def event_generator():
        txt = "hi, I'm a language model, nice to meet you today, what are you up to?"
        for word in txt.split(" "):
            logger.debug(f"word = {word }")
            time.sleep(1)
            yield f"data:{word} \n\n"
        logger.debug(f"word = </s>")
        time.sleep(1)
        yield "data:</s>\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
    )

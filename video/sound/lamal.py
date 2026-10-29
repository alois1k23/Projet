"""Habillage sonore du post « Changer de caisse-maladie », mêmes sons que la vidéo explicative.

Usage : python3 sound/lamal.py src/lamal/cues.json out/son.wav
"""

import json
import os
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from soundtrack import BEAT, SR, chime, kick, pad, place, plucks, pop, reverb, riser, tap, thud, tick, whoosh  # noqa: E402


def main(cues_path, out_path):
    cues = json.load(open(cues_path))
    fps = cues["fps"]
    duration = cues["duration"] / fps
    ch = {c["id"]: c for c in cues["chapters"]}
    ev = cues["events"]

    def at(cid, local):
        return (ch[cid]["start"] + local) / fps

    music = pad(duration, 0)
    body = (at("regle", 0), duration - 1.2)
    music += plucks(duration, [body])
    beats = np.zeros_like(music)
    t = body[0]
    while t < body[1]:
        place(beats, kick(), t, 0.5)
        t += BEAT * 2
    music += beats
    fade = np.minimum(1, np.arange(len(music)) / (SR * 1.0)) * np.minimum(1, (len(music) - np.arange(len(music))) / (SR * 1.5))
    music *= fade * 0.8

    sfx = np.zeros_like(music)

    def P(sound, cid, local, gain=1.0):
        place(sfx, sound, at(cid, local), gain)

    P(pop(0.8), "hook", 10)  # badge de hausse
    P(whoosh(0.5, 0.25), "hook", ev["hook"]["swap"] - 6)
    P(riser(1.0), "hook", 60)
    for cid in ("regle", "fin"):
        place(sfx, whoosh(0.7, 0.32, 3200), at(cid, 0) - 0.35)
    for cid in ("comparer", "assurer", "resilier", "envoyer", "clair"):
        place(sfx, whoosh(0.4, 0.16, 2600), at(cid, 0) - 0.2)

    e = ev["regle"]
    P(thud(), "regle", e["date"], 0.8)
    P(pop(1.2), "regle", e["date"] + 2)
    P(whoosh(0.3, 0.12, 5000), "regle", e["mark"])

    e = ev["comparer"]
    for i in range(4):
        P(pop(0.9 + i * 0.1), "comparer", e["bars"] + i * 5, 0.8)
    P(chime((84, 88, 91)), "comparer", e["best"])

    e = ev["assurer"]
    P(whoosh(0.35, 0.14), "assurer", e["arrow"])
    P(chime((84, 91)), "assurer", e["confirm"])

    e = ev["resilier"]
    for k in ("f0", "f1", "f2", "f3"):
        P(whoosh(0.25, 0.1, 5000), "resilier", e[k])
    P(chime((76, 72), gap=0.11, vol=0.14), "resilier", e["warn"])

    e = ev["envoyer"]
    P(thud(), "envoyer", e["stamp"], 1.0)
    P(pop(0.7), "envoyer", e["stamp"])
    P(pop(1.3), "envoyer", e["receipt"])

    e = ev["clair"]
    for f in range(e["typeStart"], e["typeEnd"], 2):
        P(tick(), "clair", f, 0.9)
    P(whoosh(0.3, 0.12, 5000), "clair", e["mark"])
    P(pop(1.1), "clair", e["card"])
    P(tap(), "clair", e["tap"])
    P(whoosh(0.6, 0.24), "clair", e["letter"])
    P(chime((84, 91, 96)), "clair", e["pdf"])

    e = ev["fin"]
    P(whoosh(0.35, 0.14, 5000), "fin", 10)
    P(chime((72, 79, 84, 88), gap=0.05, vol=0.2), "fin", e["logo"])
    P(thud(), "fin", e["logo"], 0.8)
    P(pop(1.1), "fin", e["platforms"])
    P(pop(1.3), "fin", e["platforms"] + 6)
    P(chime((88, 96), vol=0.1), "fin", e["follow"])

    mix = reverb(music, 2.2, 0.25) + reverb(sfx, 1.0, 0.12)
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
    right = np.concatenate([np.zeros(int(0.004 * SR)), mix[: -int(0.004 * SR)]]) * 0.6 + mix * 0.4
    pcm = (np.clip(np.stack([mix, right], axis=1), -1, 1) * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

"""Habillage sonore de la vidéo explicative, synthétisé (aucun échantillon externe, aucun droit d'auteur).

Usage : python3 sound/soundtrack.py src/explainer/cues.json out/son.wav
Les bruitages sont placés sur les mêmes repères (cues.json) que l'animation.
"""

import json
import sys
import wave

import numpy as np

SR = 48_000
rng = np.random.default_rng(7)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def env(n, a=0.005, r=0.1, curve=4.0):
    """Enveloppe attaque linéaire, décroissance exponentielle."""
    x = np.arange(n) / SR
    e = np.minimum(1.0, x / max(a, 1e-4))
    return e * np.exp(-curve * np.maximum(0, x - a) / max(r, 1e-4))


def lowpass(x, cutoff):
    alpha = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # sons courts uniquement
        acc += alpha * (x[i] - acc)
        y[i] = acc
    return y


def fft_convolve(a, b):
    n = len(a) + len(b) - 1
    size = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, size) * np.fft.rfft(b, size), size)[:n]


def note(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# ---------- bruitages ----------


def tap():
    t = t_(0.06)
    f = np.linspace(1500, 700, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.001, 0.025) * 0.35


def pop(pitch=1.0):
    t = t_(0.09)
    f = np.linspace(520, 880, len(t)) * pitch
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.04) * 0.22


def tick():
    n = int(0.012 * SR)
    return rng.standard_normal(n) * env(n, 0.0005, 0.004) * 0.10


def shutter():
    n = int(0.16 * SR)
    out = np.zeros(n)
    for start, amp in ((0, 0.6), (int(0.07 * SR), 0.45)):
        m = int(0.03 * SR)
        burst = rng.standard_normal(m) * env(m, 0.0005, 0.008)
        burst = burst - lowpass(burst, 1800)  # passe-haut : clic sec
        out[start : start + m] += burst * amp
    return out


def chime(notes=(88, 95), gap=0.07, vol=0.18):
    total = gap * len(notes) + 0.9
    out = np.zeros(int(total * SR))
    for i, m in enumerate(notes):
        t = t_(0.9)
        f = note(m)
        tone = sum(np.sin(2 * np.pi * f * k * t) / (k * k) for k in (1, 2, 3)) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t)
        s = int(i * gap * SR)
        out[s : s + len(t)] += tone * env(len(t), 0.002, 0.35) * vol
    return out


def whoosh(dur=0.55, vol=0.28, bright=2500):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 2
    lp = lowpass(x, bright)
    band = lp - lowpass(lp, 300)
    return band * shape * vol


def thud():
    t = t_(0.25)
    f = np.linspace(120, 50, len(t))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.08) * 0.35


def alert():
    return chime((76, 72), gap=0.11, vol=0.15)


def riser(dur=0.9):
    n = int(dur * SR)
    x = rng.standard_normal(n)
    lp = lowpass(x, 4000)
    shape = np.linspace(0, 1, n) ** 2.5
    return (lp - lowpass(lp, 600)) * shape * 0.22


def kick():
    t = t_(0.32)
    f = 48 + 90 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.12) * 0.55


# ---------- musique ----------

BPM = 100
BEAT = 60 / BPM
CHORDS = [  # Do maj7 – La m7 – Fa maj7 – Sol 6, deux mesures chacun
    [48, 55, 59, 64, 67],
    [45, 52, 55, 60, 64],
    [41, 48, 52, 57, 64],
    [43, 50, 55, 59, 64],
]


def pad(duration, start_music, stop_bed=None):
    out = np.zeros(int(duration * SR) + SR)
    bar = BEAT * 4
    t0 = 0.0
    i = 0
    while t0 < duration:
        chord = CHORDS[i % len(CHORDS)]
        length = bar * 2
        t = t_(length + 1.2)
        seg = np.zeros(len(t))
        for m in chord:
            f = note(m + 12)
            for det in (-0.12, 0.12):
                ff = f * 2 ** (det / 12 / 4)
                seg += np.sin(2 * np.pi * ff * t) + 0.25 * np.sin(2 * np.pi * 2 * ff * t)
        a = np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, (length + 1.2 - t) / 1.0))
        seg *= a / len(chord) * 0.11
        s = int(t0 * SR)
        out[s : s + len(seg)] += seg[: len(out) - s]
        t0 += length
        i += 1
    return out[: int(duration * SR)]


def plucks(duration, ranges):
    out = np.zeros(int(duration * SR) + SR)
    eighth = BEAT / 2
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    for (a, b) in ranges:
        t0 = a
        k = 0
        while t0 < b:
            bar_index = int(t0 / (BEAT * 8))
            chord = CHORDS[bar_index % len(CHORDS)]
            m = chord[pattern[k % len(pattern)]] + 24
            t = t_(0.35)
            f = note(m)
            tone = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)) * env(len(t), 0.002, 0.09)
            s = int(t0 * SR)
            out[s : s + len(tone)] += tone * 0.045
            t0 += eighth
            k += 1
    return out[: int(duration * SR)]


def place(track, sound, at_seconds, gain=1.0):
    s = int(at_seconds * SR)
    if s >= len(track):
        return
    e = min(len(track), s + len(sound))
    track[s:e] += sound[: e - s] * gain


def reverb(x, seconds=1.6, mix=0.22):
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 4.2)
    ir[: int(0.012 * SR)] = 0
    wet = fft_convolve(x, ir)[: len(x)]
    wet /= np.max(np.abs(wet)) + 1e-9
    return x + wet * mix * np.max(np.abs(x))


def main(cues_path, out_path):
    cues = json.load(open(cues_path))
    fps = cues["fps"]
    duration = cues["duration"] / fps
    ch = {c["id"]: c for c in cues["chapters"]}
    ev = cues["events"]

    def at(cid, local):
        return (ch[cid]["start"] + local) / fps

    music = pad(duration, 0)
    # Pulsation douce pendant la démonstration, silence rythmique pendant la sécurité, retour à la fin.
    demo = (at("photo", 0), at("securite", 0))
    end = (at("fin", 0), duration - 1.5)
    music += plucks(duration, [demo, end])
    beat_track = np.zeros_like(music)
    t0 = demo[0]
    while t0 < demo[1]:
        place(beat_track, kick(), t0, 0.5)
        t0 += BEAT * 2
    t0 = end[0]
    while t0 < end[1]:
        place(beat_track, kick(), t0, 0.5)
        t0 += BEAT * 2
    music += beat_track
    # Fondu d'entrée et de sortie
    fade_in = np.minimum(1, np.arange(len(music)) / (SR * 1.2))
    fade_out = np.minimum(1, (len(music) - np.arange(len(music))) / (SR * 1.5))
    music *= fade_in * fade_out * 0.8

    sfx = np.zeros_like(music)
    P = lambda s, cid, local, g=1.0: place(sfx, s, at(cid, local), g)  # noqa: E731

    # Accroche et transitions
    P(whoosh(0.5, 0.25), "hook", ev["hook"]["swap"] - 6)
    P(riser(1.0), "hook", 75)
    for cid in ("photo", "securite", "fin"):
        place(sfx, whoosh(0.7, 0.32, 3200), at(cid, 0) - 0.35)

    e = ev["photo"]
    for k in ("shutter1", "shutter2"):
        P(shutter(), "photo", e[k], 0.9)
    for k in ("page1", "page2"):
        P(thud(), "photo", e[k], 0.7)
        P(pop(1.2), "photo", e[k])
    P(tap(), "photo", e["addPage"])
    P(tap(), "photo", e["analyse"])
    P(whoosh(0.45, 0.18), "photo", e["analyse"] + 4)

    e = ev["comprendre"]
    for k in ("step1", "step2", "step3"):
        P(pop(1.5), "comprendre", e[k], 0.8)
    P(chime((84, 91)), "comprendre", e["result"])
    P(pop(1.1), "comprendre", e["badge"])
    for f in range(e["typeStart"], e["typeEnd"], 2):
        P(tick(), "comprendre", f, 0.9)
    P(whoosh(0.35, 0.14, 5000), "comprendre", e["typeEnd"] + 4)

    e = ev["essentiel"]
    for i, k in enumerate(("card0", "card1", "card2", "card3")):
        P(pop(1 + i * 0.12), "essentiel", e[k])
    P(tap(), "essentiel", e["copyTap"])
    P(chime((91,), vol=0.12), "essentiel", e["copyTap"] + 2)
    P(alert(), "essentiel", e["review"])

    e = ev["agir"]
    P(tap(), "agir", e["doneTap"])
    P(chime((84, 88, 91)), "agir", e["doneTap"] + 2)
    P(whoosh(0.5, 0.2), "agir", e["list"])
    for i, k in enumerate(("g0", "g1", "g2")):
        P(pop(1 + i * 0.15), "agir", e[k])

    e = ev["rappels"]
    P(chime((84, 88, 91), gap=0.09, vol=0.16), "rappels", e["notif"])
    P(tap(), "rappels", e["calTap"])
    P(whoosh(0.5, 0.2), "rappels", e["cal"])
    for i, k in enumerate(("dot0", "dot1", "dot2")):
        P(pop(1.2 + i * 0.15), "rappels", e[k])

    e = ev["lettres"]
    for i in range(5):
        P(pop(0.9 + i * 0.1), "lettres", 4 + i * 6, 0.7)
    P(tap(), "lettres", e["pick"])
    P(whoosh(0.45, 0.18), "lettres", e["form"])
    P(chime((86, 93), vol=0.12), "lettres", e["form"] + 8)
    for f in range(e["typeStart"], e["typeEnd"], 2):
        P(tick(), "lettres", f, 0.9)
    P(whoosh(0.3, 0.12, 5000), "lettres", e["langTap"])
    P(tap(), "lettres", e["letter"] - 4)
    P(whoosh(0.6, 0.24), "lettres", e["letter"])
    P(chime((84, 91, 96)), "lettres", e["pdf"])

    e = ev["retrouver"]
    for f in range(e["typeStart"], e["typeEnd"], 3):
        P(tick(), "retrouver", f, 0.9)
    P(whoosh(0.45, 0.18, 4000), "retrouver", e["filter"])

    e = ev["securite"]
    P(thud(), "securite", e["lock"] + 22, 0.8)
    P(chime((79, 86), vol=0.12), "securite", e["lock"] + 24)
    for i, k in enumerate(("row0", "row1", "row2")):
        P(pop(0.9 + i * 0.1), "securite", e[k])
    P(pop(1.3), "securite", e["langs"])

    e = ev["fin"]
    P(whoosh(0.35, 0.14, 5000), "fin", 10)
    P(chime((72, 79, 84, 88), gap=0.05, vol=0.2), "fin", e["logo"])
    P(thud(), "fin", e["logo"], 0.8)
    P(pop(1.1), "fin", e["platforms"])
    P(pop(1.3), "fin", e["platforms"] + 6)
    P(chime((88, 96), vol=0.1), "fin", e["follow"])

    mix = reverb(music, 2.2, 0.25) + reverb(sfx, 1.0, 0.12)
    # Normalisation : crête à -1 dBFS.
    mix = mix / (np.max(np.abs(mix)) + 1e-9) * 0.89
    # Stéréo légère : la musique est élargie par un très court décalage.
    left = mix
    right = np.concatenate([np.zeros(int(0.004 * SR)), mix[: -int(0.004 * SR)]]) * 0.6 + mix * 0.4
    stereo = np.stack([left, right], axis=1)
    pcm = (np.clip(stereo, -1, 1) * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])

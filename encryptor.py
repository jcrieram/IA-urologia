"""Cifra/descifra archivos con AES-256 (Fernet) usando una contraseña.

Uso:
    python encryptor.py encrypt <archivo>
    python encryptor.py decrypt <archivo.enc>
"""

import base64
import os
import sys
from getpass import getpass
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


SALT_LEN = 16
KDF_ITERATIONS = 480_000


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=KDF_ITERATIONS,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))


def encrypt_file(path_in: Path, password: str) -> Path:
    salt = os.urandom(SALT_LEN)
    key = _derive_key(password, salt)
    token = Fernet(key).encrypt(path_in.read_bytes())
    path_out = path_in.with_suffix(path_in.suffix + ".enc")
    path_out.write_bytes(salt + token)
    return path_out


def decrypt_file(path_in: Path, password: str) -> Path:
    blob = path_in.read_bytes()
    salt, token = blob[:SALT_LEN], blob[SALT_LEN:]
    key = _derive_key(password, salt)
    data = Fernet(key).decrypt(token)
    path_out = path_in.with_suffix("")
    if path_out == path_in:
        path_out = path_in.parent / (path_in.stem + ".decrypted")
    path_out.write_bytes(data)
    return path_out


def _cli() -> int:
    if len(sys.argv) != 3 or sys.argv[1] not in {"encrypt", "decrypt"}:
        print(__doc__)
        return 2
    action, target = sys.argv[1], Path(sys.argv[2])
    if not target.exists():
        print(f"No existe: {target}")
        return 1
    pwd = getpass("Contraseña: ")
    try:
        if action == "encrypt":
            out = encrypt_file(target, pwd)
        else:
            out = decrypt_file(target, pwd)
    except InvalidToken:
        print("Contraseña incorrecta o archivo corrupto.")
        return 1
    print(f"OK: {out}")
    return 0


if __name__ == "__main__":
    sys.exit(_cli())

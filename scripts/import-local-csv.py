"""Prepare SQL from the supplied CSV exports without copying auth passwords."""
import base64
import csv
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "SpreadsheetYangLama"
csv.field_size_limit(100_000_000)


def read(name):
    with (SOURCE / f"AplikasiID Products - {name}.csv").open(encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        if any(None in row or None in row.values() for row in rows):
            raise ValueError(f"Malformed CSV: {name}")
        return rows


def number(value, default=0):
    result = float(value) if value.strip() else default
    if not math.isfinite(result):
        raise ValueError("Invalid numeric value")
    return int(result) if result == int(result) else result


def literal(value):
    return "'" + str(value).replace("'", "''") + "'"


def json_sql(value):
    return literal(json.dumps(value, ensure_ascii=False, allow_nan=False)) + "::jsonb"


def unique(rows, key):
    ids = [row[key].strip() for row in rows]
    if any(not value for value in ids) or len(set(ids)) != len(ids):
        raise ValueError(f"Blank or duplicate {key}")


products = read("products")
faq = read("chat_faq")
unique(products, "id")
unique(faq, "id")
sql = ["-- Source: SpreadsheetYangLama CSV exports. Existing IDs are preserved.",
       "begin;", "set local standard_conforming_strings = on;"]
assets = set()
for index, product in enumerate(products):
    for key in ["price", "originalPrice", "rating", "sales"]:
        product[key] = number(product[key])
    product["sortOrder"] = number(product["sortOrder"], index)
    if not isinstance(product["sortOrder"], int):
        raise ValueError("sortOrder must be an integer")
    product["specs"] = [s.strip() for s in product["specs"].split(",") if s.strip()]
    for key in ["imageUrl", "catalogImageUrl"]:
        value = product[key]
        if value.startswith("data:image/"):
            header, encoded = value.split(",", 1)
            extensions = {"data:image/png;base64": "png", "data:image/jpeg;base64": "jpg", "data:image/webp;base64": "webp"}
            if header not in extensions:
                raise ValueError("Unsupported embedded image")
            image = base64.b64decode(encoded, validate=True)
            filename = hashlib.sha256(image).hexdigest()[:20] + "." + extensions[header]
            target = ROOT / "public/assets/imported" / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(image)
            assert target.read_bytes() == image
            product[key] = "/assets/imported/" + filename
            assets.add(filename)
    sql.append(f"insert into public.products(id,data,sort_order) values ({literal(product['id'])},{json_sql(product)},{product['sortOrder']}) on conflict (id) do nothing;")

settings_counts = {}
for name, target in [("homepage_settings", "homepage"), ("footer", "footer")]:
    rows = read(name)
    unique(rows, "key")
    settings = {row["key"].strip(): row["value"] for row in rows}
    settings_counts[target] = len(settings)
    sql.append(f"insert into public.site_settings(id,data) values ({literal(target)},{json_sql(settings)}) on conflict (id) do nothing;")

for index, item in enumerate(faq):
    item["active"] = item["active"].strip().lower() not in ["false", "0"]
    item["sortOrder"] = number(item["sortOrder"], index)
    if not isinstance(item["sortOrder"], int):
        raise ValueError("FAQ sortOrder must be an integer")
    sql.append(f"insert into public.chat_faq(id,data,active,sort_order) values ({literal(item['id'])},{json_sql(item)},{str(item['active']).lower()},{item['sortOrder']}) on conflict (id) do nothing;")
sql.append("commit;")
target = ROOT / "supabase/import-data.sql"
target.write_text("\n".join(sql) + "\n", encoding="utf-8")
print(json.dumps({"products": len(products), "faq": len(faq), "settings": settings_counts, "extracted_images": len(assets), "sql_bytes": target.stat().st_size}))

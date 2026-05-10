#!/usr/bin/env python3
"""
Immich Duplicate Detector & Remover
Détecte et supprime les doublons d'images via perceptual hashing
"""

import os
import sys
import requests
import json
from pathlib import Path
from typing import List, Dict, Tuple
import argparse

try:
    from PIL import Image
    import imagehash
    import io
except ImportError:
    print("❌ Dépendances manquantes. Installer avec:")
    print("   pip install pillow imagehash requests")
    sys.exit(1)

# Configuration
IMMICH_URL = os.getenv("IMMICH_URL", "http://100.113.214.55:2283")
IMMICH_API_KEY = os.getenv("IMMICH_API_KEY", "")

class ImmichDuplicateDetector:
    def __init__(self, api_key: str, url: str = IMMICH_URL, dry_run: bool = True, similarity: float = 0.95):
        self.api_key = api_key
        self.url = url.rstrip("/")
        self.dry_run = dry_run
        self.similarity_threshold = similarity
        self.headers = {"x-api-key": api_key}
        self.duplicates: List[Tuple[Dict, Dict, float]] = []

    def get_all_assets(self) -> List[Dict]:
        """Récupère toutes les images d'Immich"""
        print("📸 Récupération des images...")
        assets = []
        skip = 0
        take = 100

        while True:
            url = f"{self.url}/api/search/metadata?skip={skip}&take={take}"
            try:
                response = requests.get(url, headers=self.headers, timeout=10)
                response.raise_for_status()
                data = response.json()

                if not data.get("assets"):
                    break

                assets.extend(data["assets"])
                skip += take
                print(f"  ✓ {len(assets)} images récupérées...", end="\r")

            except Exception as e:
                print(f"\n❌ Erreur API: {e}")
                break

        print(f"\n✅ {len(assets)} images trouvées\n")
        return assets

    def get_image_hash(self, asset_id: str) -> str:
        """Calcule le perceptual hash d'une image"""
        try:
            # Récupérer la thumbnail (plus rapide que l'original)
            url = f"{self.url}/api/assets/{asset_id}/thumbnail?size=preview"
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()

            img = Image.open(io.BytesIO(response.content))
            # Utiliser dhash (plus rapide) ou phash selon les besoins
            return str(imagehash.dhash(img))
        except Exception as e:
            print(f"⚠️  Erreur hash pour {asset_id}: {e}")
            return None

    def compare_hashes(self, hash1: str, hash2: str) -> float:
        """Calcule la similarité entre deux hashes (0.0 à 1.0)"""
        if not hash1 or not hash2:
            return 0.0

        h1 = imagehash.ImageHash(hash1)
        h2 = imagehash.ImageHash(hash2)

        # Distance de Hamming normalisée (0 = identique, 1 = totalement différent)
        distance = (h1 - h2) / 64.0
        similarity = 1.0 - distance
        return similarity

    def detect_duplicates(self, assets: List[Dict]) -> None:
        """Détecte les doublons par perceptual hash"""
        print(f"🔍 Calcul des hashs ({len(assets)} images)...")

        hashes = {}
        for i, asset in enumerate(assets):
            asset_id = asset.get("id")
            if not asset_id:
                continue

            h = self.get_image_hash(asset_id)
            if h:
                hashes[asset_id] = (h, asset)

            if (i + 1) % 10 == 0:
                print(f"  ✓ {i + 1}/{len(assets)} hashs calculés...", end="\r")

        print(f"\n✅ {len(hashes)} hashs calculés\n")

        # Comparer les hashes
        print("⚙️  Comparaison des images...")
        asset_ids = list(hashes.keys())

        for i in range(len(asset_ids)):
            for j in range(i + 1, len(asset_ids)):
                id1, id2 = asset_ids[i], asset_ids[j]
                h1, asset1 = hashes[id1]
                h2, asset2 = hashes[id2]

                similarity = self.compare_hashes(h1, h2)

                if similarity >= self.similarity_threshold:
                    self.duplicates.append((asset1, asset2, similarity))

        print(f"✅ Détection terminée\n")

    def display_duplicates(self) -> None:
        """Affiche les doublons trouvés"""
        if not self.duplicates:
            print("✅ Aucun doublon détecté!\n")
            return

        print(f"⚠️  {len(self.duplicates)} doublon(s) détecté(s):\n")

        for i, (asset1, asset2, similarity) in enumerate(self.duplicates, 1):
            print(f"--- Doublon #{i} (Similarité: {similarity*100:.1f}%) ---")
            print(f"Image 1: {asset1.get('originalFileName')} ({asset1.get('id')})")
            print(f"  Date: {asset1.get('createdAt')}")
            print(f"  Size: {asset1.get('exifInfo', {}).get('imageDimensions', 'N/A')}")
            print()
            print(f"Image 2: {asset2.get('originalFileName')} ({asset2.get('id')})")
            print(f"  Date: {asset2.get('createdAt')}")
            print(f"  Size: {asset2.get('exifInfo', {}).get('imageDimensions', 'N/A')}")
            print()

    def delete_asset(self, asset_id: str) -> bool:
        """Supprime une image"""
        try:
            url = f"{self.url}/api/assets/{asset_id}"
            response = requests.delete(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"❌ Erreur suppression {asset_id}: {e}")
            return False

    def remove_duplicates(self, keep_newer: bool = True) -> None:
        """Supprime les doublons (garde le plus récent par défaut)"""
        if not self.duplicates:
            print("Aucun doublon à supprimer\n")
            return

        if self.dry_run:
            print("🔒 MODE DRY-RUN - Aucune suppression effectuée\n")
        else:
            print(f"⚠️  Suppression de {len(self.duplicates)} doublon(s)...\n")

        deleted_count = 0
        for i, (asset1, asset2, similarity) in enumerate(self.duplicates, 1):
            # Garder le plus récent, supprimer l'autre
            date1 = asset1.get("createdAt", "")
            date2 = asset2.get("createdAt", "")

            if keep_newer and date2 > date1:
                to_delete = asset1
                to_keep = asset2
            else:
                to_delete = asset2
                to_keep = asset1

            delete_id = to_delete.get("id")
            delete_name = to_delete.get("originalFileName")
            keep_name = to_keep.get("originalFileName")

            print(f"Doublon #{i}:")
            print(f"  🗑️  Supprimer: {delete_name}")
            print(f"  ✅ Garder:     {keep_name}")

            if not self.dry_run:
                if self.delete_asset(delete_id):
                    print(f"  ✓ Supprimé!")
                    deleted_count += 1
                else:
                    print(f"  ✗ Erreur suppression")
            print()

        if not self.dry_run:
            print(f"✅ {deleted_count} image(s) supprimée(s)\n")
        else:
            print(f"📋 Simulation: {len(self.duplicates)} image(s) auraient été supprimées\n")

def main():
    parser = argparse.ArgumentParser(description="Détecte et supprime les doublons Immich")
    parser.add_argument("--dry-run", action="store_true", default=True,
                      help="Mode simulation (défaut: activé)")
    parser.add_argument("--delete", action="store_true",
                      help="Vraiment supprimer les doublons")
    parser.add_argument("--similarity", type=float, default=0.95,
                      help="Seuil de similarité 0.0-1.0 (défaut: 0.95)")
    parser.add_argument("--url", default=IMMICH_URL,
                      help=f"URL Immich (défaut: {IMMICH_URL})")
    parser.add_argument("--api-key", required=False,
                      help="Clé API Immich (ou env IMMICH_API_KEY)")

    args = parser.parse_args()

    # Récupérer la clé API
    api_key = args.api_key or IMMICH_API_KEY
    if not api_key:
        print("❌ Clé API Immich requise!")
        print("   Utiliser: --api-key ou env IMMICH_API_KEY")
        sys.exit(1)

    # Créer le détecteur
    detector = ImmichDuplicateDetector(
        api_key=api_key,
        url=args.url,
        dry_run=not args.delete,
        similarity=args.similarity
    )

    print(f"🚀 Détecteur de doublons Immich")
    print(f"   URL: {args.url}")
    print(f"   Similarité: {args.similarity*100:.0f}%")
    print(f"   Mode: {'DRY-RUN (simulation)' if detector.dry_run else '⚠️  SUPPRESSION RÉELLE'}")
    print()

    # Récupérer les images
    assets = detector.get_all_assets()
    if not assets:
        print("❌ Aucune image trouvée")
        sys.exit(1)

    # Détecter les doublons
    detector.detect_duplicates(assets)

    # Afficher les résultats
    detector.display_duplicates()

    # Supprimer si demandé
    if detector.duplicates:
        detector.remove_duplicates(keep_newer=True)

    if detector.dry_run:
        print("💡 Pour vraiment supprimer, exécuter avec: --delete")

if __name__ == "__main__":
    main()

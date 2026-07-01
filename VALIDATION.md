# VALIDATION.md — Cas de test & sources

Ce document décrit trois cas de test pour valider les calculs du simulateur, avec les sources officielles correspondantes.

---

## Cas 1 : Frais de notaire — Achat ancien à 200 000 €

**Données d'entrée :**
- Prix du bien : 200 000 €
- Type : Ancien

**Résultat attendu :**
| Composante | Montant |
|---|---|
| Droits de mutation (5,81 %) | 11 620,00 € |
| Émoluments notaire HT (barème dégressif) | ~1 995,25 € |
| Émoluments notaire TTC (+20 % TVA) | ~2 394,30 € |
| Contribution sécurité immobilière (0,10 %) | 200,00 € |
| Débours | 1 200,00 € |
| **Total** | **~15 414,30 €** |
| **Pourcentage effectif** | **~7,71 %** |

**Détail du calcul des émoluments :**
- 6 500 × 3,870 % = 251,55 €
- (17 000 - 6 500) × 1,596 % = 167,58 €
- (60 000 - 17 000) × 1,064 % = 457,52 €
- (200 000 - 60 000) × 0,799 % = 1 118,60 €
- Total HT : 1 995,25 €

**Source :** [service-public.fr — Frais de notaire (achat immobilier)](https://www.service-public.fr/particuliers/vosdroits/F17759)

---

## Cas 2 : Droits de succession — Enfant héritant de 300 000 €

**Données d'entrée :**
- Montant net de la part : 300 000 €
- Lien de parenté : Enfant
- Handicap : Non

**Résultat attendu :**
| Étape | Montant |
|---|---|
| Abattement | 100 000 € |
| Part nette taxable | 200 000 € |
| Tranche 0-8 072 € à 5 % | 403,60 € |
| Tranche 8 072-12 109 € à 10 % | 403,70 € |
| Tranche 12 109-15 932 € à 15 % | 573,45 € |
| Tranche 15 932-200 000 € à 20 % | 36 813,60 € |
| **Total des droits** | **38 194,35 €** |
| **Taux effectif** | **~12,73 %** |

**Source :** [service-public.fr — Droits de succession : calcul et paiement](https://www.service-public.fr/particuliers/vosdroits/F14198)

---

## Cas 3 : Droits de succession — Conjoint survivant (exonéré)

**Données d'entrée :**
- Montant net de la part : 500 000 €
- Lien de parenté : Conjoint / Pacsé
- Handicap : Non

**Résultat attendu :**
| Étape | Montant |
|---|---|
| Droits de succession | **0 €** |
| Exonéré | **Oui** |

Le conjoint survivant et le partenaire de PACS sont totalement exonérés de droits de succession depuis la loi TEPA du 21 août 2007, quel que soit le montant de la succession.

**Source :** [service-public.fr — Succession : exonération du conjoint survivant](https://www.service-public.fr/particuliers/vosdroits/F17456)

---

## Barèmes officiels utilisés

Tous les barèmes implémentés dans `src/lib/baremes-2026.ts` sont issus de :

1. **Émoluments du notaire** : Arrêté du 26 février 2016 fixant les tarifs réglementés des notaires (modifié)
2. **Droits de mutation** : Article 1594 D du Code général des impôts (taux départemental) + Article 683 (taux droit commun)
3. **Droits de succession** : Articles 777 et suivants du Code général des impôts
4. **Abattements** : Article 779 du Code général des impôts
5. **Exonération du conjoint** : Article 796-0 bis du CGI (loi TEPA 2007)

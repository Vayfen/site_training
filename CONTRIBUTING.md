# Guide de Contribution - RunAI

Merci de votre intérêt pour contribuer à RunAI ! Ce document explique comment contribuer au projet.

## Code de Conduite

Soyez respectueux et professionnel dans toutes vos interactions.

## Comment Contribuer

### Signaler un Bug

1. Vérifiez que le bug n'a pas déjà été signalé
2. Ouvrez une nouvelle issue avec :
   - Une description claire du problème
   - Les étapes pour reproduire
   - Le comportement attendu vs le comportement actuel
   - Votre environnement (OS, version de Python/Node, etc.)

### Proposer une Nouvelle Fonctionnalité

1. Ouvrez une issue pour discuter de la fonctionnalité
2. Expliquez pourquoi cette fonctionnalité serait utile
3. Attendez les retours avant de commencer le développement

### Soumettre des Modifications

1. Forkez le repository
2. Créez une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```

3. Faites vos modifications en suivant les conventions de code

4. Committez vos changements :
   ```bash
   git commit -m "feat: ajoute une nouvelle fonctionnalité"
   ```

5. Pushez vers votre fork :
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

6. Ouvrez une Pull Request

## Conventions de Code

### Backend (Python)

- Suivez PEP 8
- Utilisez des docstrings pour les fonctions
- Écrivez des tests pour les nouvelles fonctionnalités
- Type hints recommandés

Exemple :
```python
def calculate_pace(distance_km: float, duration_seconds: int) -> int:
    """
    Calculate pace in seconds per kilometer.

    Args:
        distance_km: Distance in kilometers
        duration_seconds: Duration in seconds

    Returns:
        Pace in seconds per kilometer
    """
    return int(duration_seconds / distance_km)
```

### Frontend (TypeScript/React)

- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les conventions ESLint du projet
- Utilisez des composants fonctionnels avec hooks
- Nommage : PascalCase pour les composants, camelCase pour les fonctions

Exemple :
```typescript
interface WorkoutCardProps {
  workout: Workout;
  onComplete: (id: number) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onComplete }) => {
  // Component logic
};
```

## Structure des Commits

Utilisez le format Conventional Commits :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage (pas de changement de code)
- `refactor:` refactoring
- `test:` ajout de tests
- `chore:` maintenance

Exemples :
```
feat: ajoute la génération d'itinéraires avec dénivelé
fix: corrige le calcul des allures en zone 2
docs: améliore le README avec des exemples
```

## Tests

### Backend

Écrivez des tests pour toutes les nouvelles fonctionnalités :

```python
def test_generate_training_plan():
    # Arrange
    user = create_test_user()
    goal = create_test_goal()

    # Act
    plan = generate_training_plan(user, goal)

    # Assert
    assert plan.duration_weeks > 0
    assert len(plan.workouts) > 0
```

Lancez les tests :
```bash
cd backend
pytest
```

### Frontend

Testez les composants et les services :

```typescript
describe('WorkoutCard', () => {
  it('should display workout details', () => {
    const workout = createMockWorkout();
    render(<WorkoutCard workout={workout} />);

    expect(screen.getByText(workout.name)).toBeInTheDocument();
  });
});
```

Lancez les tests :
```bash
cd frontend
npm test
```

## Documentation

- Documentez les nouvelles fonctionnalités
- Mettez à jour le README si nécessaire
- Ajoutez des commentaires pour le code complexe
- Mettez à jour l'API documentation (OpenAPI/Swagger)

## Processus de Review

1. Les Pull Requests sont reviewées par les mainteneurs
2. Les changements demandés doivent être effectués
3. Les tests doivent passer
4. Au moins une approbation est requise

## Questions ?

N'hésitez pas à ouvrir une issue ou à demander sur les discussions du projet.

Merci de contribuer à RunAI ! 🏃‍♂️

# Sphere

## How to run

Navigate to the directory where the project is located and run:

```
npx serve .
```

## World generation

### Simplex Noise

The Simplex Noise function generates coherent noise, which means that the output values change smoothly over the input domain. The parameters `freq`, `octaves`, and `persistence` are used to control the appearance of the generated noise, and by adjusting these parameters, you can create a more realistic representation of continents and oceans on your globe.

1. `freq` (Frequency): This parameter controls the scale of the noise. Higher frequency values result in more fine-grained details and smaller features in the noise, while lower frequency values result in larger, more homogeneous areas.
2. `octaves`: This parameter determines the number of layers of noise that are combined to produce the final output. Each additional octave adds finer details to the noise. The more octaves you use, the more complex and rich the noise pattern will be. However, using too many octaves can create a noisy appearance that may not look natural.
3. `persistence`: This parameter determines the amplitude falloff for each successive octave. It is a value between 0 and 1. A higher persistence value means that each octave contributes more significantly to the final output, resulting in a rougher appearance with more high-frequency details. Lower persistence values cause each successive octave to have a smaller impact, creating a smoother and more natural appearance.

To create a more realistic representation of continents on your globe, you can experiment with these parameters:

- Lower the frequency value to create larger continental shapes.
- Increase the number of octaves to add more detail and complexity to the continent shapes.
- Adjust the persistence value to control the balance between high-frequency details and smooth, natural-looking shapes. You can start with a lower persistence value and increase it slowly to find the optimal balance.
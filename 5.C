#if UNITY_EDITOR
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

namespace HackathonGame.Goblins.EditorTools
{
    /// <summary>
    /// Menu: Hackathon > Goblins > Create Goblin Prefab
    /// Bakes the procedural goblin into a real prefab with saved material assets.
    /// Use this prefab for Quest builds: it keeps the shaders referenced, so they
    /// aren't stripped from the APK (Shader.Find at runtime can fail on device).
    /// </summary>
    public static class GoblinPrefabCreator
    {
        const string Root = "Assets/_Game/01_Goblins";

        [MenuItem("Hackathon/Goblins/Create Goblin Prefab")]
        public static void Create()
        {
            EnsureFolder(Root + "/Prefabs");
            EnsureFolder(Root + "/Materials");

            GameObject go = GoblinBuilder.Build(new Color(0.35f, 0.60f, 0.25f));
            var saved = new Dictionary<Material, Material>();

            foreach (Renderer r in go.GetComponentsInChildren<Renderer>())
            {
                Material[] mats = r.sharedMaterials;
                for (int i = 0; i < mats.Length; i++)
                {
                    Material m = mats[i];
                    if (!saved.TryGetValue(m, out Material asset))
                    {
                        string path = AssetDatabase.GenerateUniqueAssetPath($"{Root}/Materials/Goblin_{m.name}.mat");
                        AssetDatabase.CreateAsset(Object.Instantiate(m), path);
                        asset = AssetDatabase.LoadAssetAtPath<Material>(path);
                        saved[m] = asset;
                    }
                    mats[i] = asset;
                }
                r.sharedMaterials = mats;
            }

            string prefabPath = Root + "/Prefabs/Goblin.prefab";
            PrefabUtility.SaveAsPrefabAsset(go, prefabPath);
            Object.DestroyImmediate(go);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Selection.activeObject = AssetDatabase.LoadAssetAtPath<GameObject>(prefabPath);
            Debug.Log("[Goblins] Prefab created at " + prefabPath);
        }

        static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string name = System.IO.Path.GetFileName(path);
            EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, name);
        }
    }
}
#endif

import json

notebook = {
    "cells": [
        {
            "cell_type": "markdown",
            "metadata": {},
            "source": [
                "# SWE-bench Anomaly Classification\n",
                "This notebook trains a model to classify problem statements."
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "import pandas as pd\n",
                "from sklearn.model_selection import train_test_split\n",
                "from sklearn.feature_extraction.text import TfidfVectorizer\n",
                "from sklearn.ensemble import RandomForestClassifier\n",
                "from sklearn.metrics import classification_report, accuracy_score\n",
                "import numpy as np\n",
                "\n",
                "# 1. Data Loading\n",
                "print('Loading dataset...')\n",
                "df = pd.read_csv('swe-bench-verified.csv')\n",
                "df = df.dropna(subset=['problem_statement'])\n",
                "print(f'Total valid records: {len(df)}')\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 2. Preprocessing & Feature Extraction\n",
                "# For this anomaly detector, we want to classify if an issue is 'Systemic' or 'Normal'.\n",
                "# Since we don't have explicit labels, we'll create a synthetic label based on 'hints_text' presence.\n",
                "# Issues with complex hints or community discussion might imply systemic difficulty.\n",
                "df['is_systemic'] = df['hints_text'].notna().astype(int)\n",
                "X = df['problem_statement']\n",
                "y = df['is_systemic']\n",
                "\n",
                "vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')\n",
                "X_vec = vectorizer.fit_transform(X)\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 3. Train / Test / Eval Split (70/15/15)\n",
                "X_temp, X_test, y_temp, y_test = train_test_split(X_vec, y, test_size=0.15, random_state=42)\n",
                "X_train, X_eval, y_train, y_eval = train_test_split(X_temp, y_temp, test_size=0.1765, random_state=42) # 0.15 / 0.85 = 0.1765\n",
                "\n",
                "print(f'Train: {X_train.shape[0]}, Test: {X_test.shape[0]}, Eval: {X_eval.shape[0]}')\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 4. Model Training\n",
                "print('Training Random Forest Classifier...')\n",
                "model = RandomForestClassifier(n_estimators=100, random_state=42)\n",
                "model.fit(X_train, y_train)\n",
                "print('Training complete.')\n"
            ]
        },
        {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {},
            "outputs": [],
            "source": [
                "# 5. Evaluation\n",
                "y_pred_eval = model.predict(X_eval)\n",
                "print('--- Evaluation Results ---')\n",
                "print(classification_report(y_eval, y_pred_eval))\n",
                "\n",
                "y_pred_test = model.predict(X_test)\n",
                "print('--- Test Results ---')\n",
                "print(classification_report(y_test, y_pred_test))\n"
            ]
        }
    ],
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.10.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

with open('e:/BrosKi/unknown/dataset/train.ipynb', 'w') as f:
    json.dump(notebook, f, indent=2)
print('Notebook created.')

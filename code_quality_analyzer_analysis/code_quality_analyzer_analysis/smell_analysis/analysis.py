import os
from typing import Union

import pandas as pd
from pandas import DataFrame


def load_and_prepare_data(file_path: str, columns: list, delimiter: str = "||") -> Union[str, DataFrame]:
    """
    Loads the CSV file, adds concatenated column for entities to the dataframe
    :param file_path: Path to the CSV file
    :param columns: Column names to be concatenated
    :param delimiter: Delimiter to use for separating text in concatenation
    :return: Dataframe containing the concatenated column
    """
    # Load the CSV file while skipping problematic lines
    try:
        df = pd.read_csv(file_path, on_bad_lines='skip')
    except Exception as e:
        return str(e)

    # Create a new concatenated column
    df['Concatenated_Column'] = df[columns].apply(lambda row: delimiter.join(row.values.astype(str)), axis=1)

    return df


def analyze_smells(df: pd.DataFrame, smell_column: str, concat_column: str = 'Concatenated_Column') -> dict:
    """
    Calculates the smell distribution as well as top entities with most smells.
    :param df: The dataframe with smells and concatenated column
    :param smell_column: Smell column name in the dataframe
    :param concat_column: Concatenated column name in the dataframe
    :return: Dictionary containing smell_distribution, top entities with respect to smells and total smells
    """
    # Determine the distribution of smells
    smell_distribution = df[smell_column].value_counts().to_dict()

    # Identify the top entities with the most smells
    top_entities = df[concat_column].value_counts().head(10).to_dict()

    return {
        "smell_distribution": smell_distribution,
        "top_entities": top_entities,
        "total_smells": sum(smell_distribution.values())
    }


def analyze_smell_files(architecture_path: str, design_path: str, implementation_path: str, testability_path: str,
                         test_path: str) -> dict:
    """
    Analyzes all the files provided by the paths
    :param architecture_path: Path to the Architecture Smell CSV file
    :param design_path: Path to the Design Smell CSV file
    :param implementation_path: Path to the Implementation Smell CSV file
    :param testability_path: Path to the Testability Smell CSV file
    :param test_path: Path to the Architecture Test CSV file
    :return: Dictionary containing analysis of all the files
    """
    analysis_dict = {
        "Architecture Smell": None,
        "Design Smell": None,
        "Implementation Smell": None,
        "Testability Smell": None,
        "Test Smell": None
    }

    # Analyze Architecture Smell
    if architecture_path:
        architecture_df = load_and_prepare_data(architecture_path, ["Project Name", "Package Name"])
        analysis_dict["Architecture Smell"] = analyze_smells(architecture_df, "Architecture Smell")

    # Analyze Design Smell
    if design_path:
        design_df = load_and_prepare_data(design_path, ["Project Name", "Package Name", "Type Name"])
        analysis_dict["Design Smell"] = analyze_smells(design_df, "Design Smell")

    # Analyze Implementation Smell
    if implementation_path:
        implementation_df = load_and_prepare_data(
            implementation_path, ["Project Name", "Package Name", "Type Name", "Method Name"]
        )
        analysis_dict["Implementation Smell"] = analyze_smells(implementation_df, "Implementation Smell")

    # Analyze Testability Smell
    if testability_path:
        testability_df = load_and_prepare_data(testability_path, ["Project Name", "Package Name", "Type Name"])
        analysis_dict["Testability Smell"] = analyze_smells(testability_df, "Testability Smell")

    # Analyze Test Smell
    if test_path:
        test_df = load_and_prepare_data(test_path, ["Project Name", "Package Name", "Type Name", "Method Name"])
        analysis_dict["Test Smell"] = analyze_smells(test_df, "Test Smell")

    return analysis_dict


def retrieve_smell_files(folder_path: str) -> dict:
    """
    Gets the smell file names within a folder
    :param folder_path: Path to the folder containing the smell files
    :return: Dictionary containing the smell file paths
    """
    # List all files in the provided folder
    files = []
    for file in os.listdir(folder_path):
        if os.path.isfile(os.path.join(folder_path, file)):
            files.append(file)

    smell_files = {
        "Architecture": None,
        "Design": None,
        "Implementation": None,
        "Testability": None,
        "Test": None
    }
    
    # Check for each type of smell individually and save the path for it
    for file in files:
        if file == "ArchitectureSmells.csv":
            smell_files["Architecture"] = os.path.join(folder_path, file)
        elif file == "DesignSmells.csv":
            smell_files["Design"] = os.path.join(folder_path, file)
        elif file == "ImplementationSmells.csv":
            smell_files["Implementation"] = os.path.join(folder_path, file)
        elif file == "TestabilitySmells.csv":
            smell_files["Testability"] = os.path.join(folder_path, file)
        elif file == "TestSmells.csv":
            smell_files["Test"] = os.path.join(folder_path, file)

    return smell_files


def analyze_smell_files_in_folder(folder_path: str) -> dict:
    """
    Analyzes all smell files in a folder
    :param folder_path: Path to the folder containing the smell files 
    :return: Dictionary containing analysis of all the files
    """
    # Retrieve the specific smell file paths
    file_paths = retrieve_smell_files(folder_path)

    # Analyze the smell files and return the dictionary
    return analyze_smell_files(
        file_paths["Architecture"],
        file_paths["Design"],
        file_paths["Implementation"],
        file_paths["Testability"],
        file_paths["Test"]
    )
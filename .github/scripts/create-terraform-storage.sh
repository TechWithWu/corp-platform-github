#!/usr/bin/env bash
set -euo pipefail

# Accept parameters from environment variables or arguments
SUBSCRIPTION_ID="${1:-$AZURE_SUBSCRIPTION_ID}"
STATE_RG_NAME="${2:-rg-terraform-state-prod}"
STATE_SA_NAME="${3:-stcorpghasstateprod}"
STATE_CONTAINER_NAME="${4:-tfstate}"
STATE_LOCATION="${5:-eastus}"

echo "=========================================="
echo " Ensuring Terraform State Backend Resources"
echo "=========================================="

# 1. Check & Create Resource Group
echo "Checking Resource Group: $STATE_RG_NAME..."
RG_EXISTS=$(az group exists --name "$STATE_RG_NAME")

if [ "$RG_EXISTS" = "false" ]; then
    echo "Creating Resource Group [$STATE_RG_NAME] in [$STATE_LOCATION]..."
    az group create --name "$STATE_RG_NAME" --location "$STATE_LOCATION" --output none
    echo "Resource Group created successfully."
else
    echo "Resource Group '$STATE_RG_NAME' already exists. Skipping."
fi

# 2. Check & Create Storage Account
echo "Checking Storage Account: $STATE_SA_NAME..."
SA_PRESENT=$(az storage account show --name "$STATE_SA_NAME" --resource-group "$STATE_RG_NAME" --query "id" -o tsv 2>/dev/null || true)

if [ -z "$SA_PRESENT" ]; then
    echo "Creating Storage Account [$STATE_SA_NAME] (Standard_LRS)..."
    az storage account create \
        --name "$STATE_SA_NAME" \
        --resource-group "$STATE_RG_NAME" \
        --location "$STATE_LOCATION" \
        --sku "Standard_LRS" \
        --kind "StorageV2" \
        --allow-blob-public-access false \
        --min-tls-version "TLS1_2" \
        --output none
    echo "Storage Account created successfully."
else
    echo "Storage Account '$STATE_SA_NAME' already exists. Skipping."
fi

# 3. Create Blob Container (Using Azure RBAC / Entra ID login mode)
echo "Ensuring Blob Container [$STATE_CONTAINER_NAME] exists..."
if az storage container create \
    --name "$STATE_CONTAINER_NAME" \
    --account-name "$STATE_SA_NAME" \
    --auth-mode login \
    --output none 2>/dev/null; then
    echo "Blob Container ensured successfully."
else
    echo "::warning::Container creation encountered an issue (it may already exist or role assignment is pending propagation)."
fi
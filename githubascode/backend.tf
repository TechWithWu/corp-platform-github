terraform {
  backend "azurerm" {
    use_oidc      = true
    lock_timeout   = "10m"
  }
}
data "github_user" "reviewers" {
  for_each = toset(local.all_user_names)
  username = each.value
}

data "github_team" "reviewers" {
  for_each = toset(local.all_team_slugs)
  slug     = each.value
}
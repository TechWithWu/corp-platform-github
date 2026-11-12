# ---------------------------------------------------------------------------------------------------------------------
# GITHUB ENVIRONMENTS MODULE - SETS UP PER-REPOSITORY DEPLOYMENT ENVIRONMENTS
# ---------------------------------------------------------------------------------------------------------------------

resource "github_repository_environment" "this" {
  for_each = var.environments

  repository          = each.value.repository
  environment         = each.value.environment
  can_admins_bypass   = coalesce(each.value.can_admins_bypass, false)
  prevent_self_review = coalesce(each.value.prevent_self_review, true)
  wait_timer          = coalesce(each.value.wait_timer, 0)

  dynamic "reviewers" {
    for_each = length(concat(each.value.reviewer_users, each.value.reviewer_teams)) > 0 ? [1] : []

    content {
      users = [for u in each.value.reviewer_users : tonumber(data.github_user.reviewers[u].id)]
      teams = [for t in each.value.reviewer_teams : data.github_team.reviewers[t].id]
    }
  }
}

use std::collections::BTreeMap;

use axum::{
    Json,
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};
use serde::Serialize;

#[derive(Serialize)]
struct ErrorBody {
    code: &'static str,
    message: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    fields: Option<BTreeMap<&'static str, &'static str>>,
}

pub struct ApiError {
    status: StatusCode,
    body: ErrorBody,
    retry_after: Option<u64>,
}

impl ApiError {
    pub fn new(status: StatusCode, code: &'static str, message: &'static str) -> Self {
        Self {
            status,
            body: ErrorBody {
                code,
                message,
                fields: None,
            },
            retry_after: None,
        }
    }

    pub fn validation(fields: BTreeMap<&'static str, &'static str>) -> Self {
        let mut error = Self::new(
            StatusCode::UNPROCESSABLE_ENTITY,
            "VALIDATION_ERROR",
            "Vérifiez les champs du formulaire.",
        );
        error.body.fields = Some(fields);
        error
    }

    pub fn rate_limited(seconds: u64) -> Self {
        let mut error = Self::new(
            StatusCode::TOO_MANY_REQUESTS,
            "RATE_LIMITED",
            "Trop de tentatives. Attendez quelques minutes avant de réessayer.",
        );
        error.retry_after = Some(seconds);
        error
    }
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let mut response = (self.status, Json(self.body)).into_response();
        if let Some(seconds) = self.retry_after {
            response.headers_mut().insert(
                header::RETRY_AFTER,
                seconds.to_string().parse().expect("integer header"),
            );
        }
        response
    }
}

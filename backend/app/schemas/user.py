from pydantic import BaseModel, EmailStr, constr


class UserCreate(BaseModel):
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15)
    full_name: constr(max_length=255)

class UserResponse(BaseModel):
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15)
    full_name: constr(max_length=255)

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: constr(min_length=8)

class UserAttendanceResponse(BaseModel):
    id: str
    full_name: constr(max_length=255)
    email: EmailStr
    phone_number: constr(min_length=10, max_length=15)
    ticket_type: str | None
    has_attended: bool
    attended_at: str | None
    payment_status: str

    class Config:
        orm_mode = True